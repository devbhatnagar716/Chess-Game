import React, { useEffect, useState, useRef } from 'react';
import Peer from 'simple-peer';
import styled from 'styled-components';
const socket = require('../connection/socket').socket;

const Container = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Row = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Video = styled.video`
  border: 1px solid blue;
  width: 50%;
  height: 50%;
`;

function VideoChatApp(props) {
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const userVideo = useRef();
  const partnerVideo = useRef();
  const peerRef = useRef(null);

  useEffect(() => {
    // Get user media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      setStream(stream);
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    // Listening for incoming calls
    socket.on("hey", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
    });

    return () => {
      // Cleanup
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      socket.off("hey");
      socket.off("callAccepted");
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [stream]);

  const callPeer = (id) => {
    setIsCalling(true);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", data => {
      socket.emit("callUser", { userToCall: id, signalData: data, from: props.mySocketId });
    });

    peer.on("stream", stream => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = stream;
      }
    });

    peer.on("close", () => {
      setCallAccepted(false);
      setIsCalling(false);
    });

    peerRef.current = peer;

    socket.on("callAccepted", signal => {
      setCallAccepted(true);
      peer.signal(signal);
    });
  };

  const acceptCall = () => {
    setCallAccepted(true);
    setIsCalling(false);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", data => {
      socket.emit("acceptCall", { signal: data, to: caller });
    });

    peer.on("stream", stream => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = stream;
      }
    });

    peer.on("close", () => {
      setCallAccepted(false);
      setIsCalling(false);
    });

    peerRef.current = peer;
    peer.signal(callerSignal);
  };

  const renderMainView = () => {
    if (callAccepted) {
      return <Video playsInline ref={partnerVideo} autoPlay />;
    } else if (receivingCall) {
      return (
        <div>
          <h1>{props.opponentUserName} is calling you</h1>
          <button onClick={acceptCall}><h1>Accept</h1></button>
        </div>
      );
    } else if (isCalling) {
      return (
        <div>
          <h1>Currently calling {props.opponentUserName}...</h1>
        </div>
      );
    } else {
      return (
        <button onClick={() => callPeer(props.opponentSocketId)}>
          <h1>Chat with your friend while you play!</h1>
        </button>
      );
    }
  };

  return (
    <Container>
      <Row>
        {renderMainView()}
        {stream && <Video playsInline muted ref={userVideo} autoPlay />}
      </Row>
    </Container>
  );
}

export default VideoChatApp;
