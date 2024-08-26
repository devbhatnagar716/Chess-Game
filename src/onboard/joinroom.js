import React from 'react';
import JoinGame from './joingame';
import ChessGame from '../chess/ui/chessgame';

/**
 * Onboard is where we create the game room.
 */

class JoinRoom extends React.Component {
    state = {
        didGetUserName: false,
        inputText: ""
    };

    constructor(props) {
        super(props);
        this.textArea = React.createRef();
        this.typingUserName = this.typingUserName.bind(this);
    }

    typingUserName = (e) => {
        // set the state with the text from the input field
        this.setState({
            inputText: e.target.value
        });
    };

    render() {
        const { didGetUserName, inputText } = this.state;

        return (
            <React.Fragment>
                {didGetUserName ? (
                    <React.Fragment>
                        <JoinGame userName={inputText} isCreator={false} />
                        <ChessGame myUserName={inputText} />
                    </React.Fragment>
                ) : (
                    <div style={{ textAlign: "center", marginTop: `${window.innerHeight / 3}px` }}>
                        <h1>Your Username:</h1>

                        <input
                            style={{ width: "240px", marginTop: "62px" }}
                            ref={this.textArea}
                            value={inputText}
                            onChange={this.typingUserName}
                        />

                        <button
                            className="btn btn-primary"
                            style={{ width: "120px", marginTop: "62px" }}
                            disabled={inputText.length === 0}
                            onClick={() => {
                                this.setState({
                                    didGetUserName: true
                                });
                            }}
                        >
                            Submit
                        </button>
                    </div>
                )}
            </React.Fragment>
        );
    }
}

export default JoinRoom;
