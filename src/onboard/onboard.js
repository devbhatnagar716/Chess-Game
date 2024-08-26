import React from 'react';
import { Navigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import ColorContext from '../context/colorcontext'; // Default import
const socket = require('../connection/socket').socket;

/**
 * Onboard is where we create the game room.
 */

class CreateNewGame extends React.Component {
  state = {
    didGetUserName: false,
    inputText: '',
    gameId: '',
  };

  constructor(props) {
    super(props);
    this.textArea = React.createRef();
  }

  send = () => {
    /**
     * This method should create a new room in the '/' namespace
     * with a unique identifier.
     */
    const newGameRoomId = uuidv4(); // Generate a unique ID for the game room

    // Set the state of this component with the gameId so that we can
    // redirect the user to that URL later.
    this.setState({
      gameId: newGameRoomId,
    });

    // Emit an event to the server to create a new room
    socket.emit('createNewGame', newGameRoomId);
  };

  typingUserName = () => {
    // Grab the input text from the field from the DOM
    const typedText = this.textArea.current.value;

    // Set the state with that text
    this.setState({
      inputText: typedText,
    });
  };

  render() {
    // !!! TODO: edit this later once you have bought your own domain.

    if (this.state.didGetUserName) {
      return <Navigate to={`/game/${this.state.gameId}`} />;
    }

    return (
      <div>
        <h1
          style={{
            textAlign: 'center',
            marginTop: `${window.innerHeight / 3}px`,
          }}
        >
          Your Username:
        </h1>

        <input
          style={{
            marginLeft: `${window.innerWidth / 2 - 120}px`,
            width: '240px',
            marginTop: '62px',
          }}
          ref={this.textArea}
          onInput={this.typingUserName}
        />

        <button
          className="btn btn-primary"
          style={{
            marginLeft: `${window.innerWidth / 2 - 60}px`,
            width: '120px',
            marginTop: '62px',
          }}
          disabled={!(this.state.inputText.length > 0)}
          onClick={() => {
            // When the 'Submit' button gets pressed from the username screen,
            // we send a request to the server to create a new room with
            // the uuid generated here.
            this.props.didRedirect();
            this.props.setUserName(this.state.inputText);
            this.setState({
              didGetUserName: true,
            });
            this.send();
          }}
        >
          Submit
        </button>
      </div>
    );
  }
}

const Onboard = (props) => {
  const color = React.useContext(ColorContext);

  return (
    <CreateNewGame
      didRedirect={color.playerDidRedirect}
      setUserName={props.setUserName}
    />
  );
};

export default Onboard;
