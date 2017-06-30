import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import Utils from './utils.js';
import client_env from './client_env.js';
import houndifyclient from './houndify-client.js';
import ResponseCard from './components/ResponseCard.jsx';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      response: {type: "text", api: "cleverbot", text: "What can I help you with?", data: Object},
      location: {}
    };

    const clientID = client_env.client_env.houndify_clientID;

    this.requestInfo = {
      ClientID: clientID,
      UserID: "test_user"
    };
  }

  componentDidMount() {
    Utils.location().
    then((data) => {
      this.setState({
        location: {
          lat: data.coords.latitude,
          lon: data.coords.longitude
        }
      })
    })
  }
  //trigger response state to change when getting back reply from Fred
  handleServerResponse(error, response) {
    if (error) {
      console.log('handleServerResponse error: ', error);
    } else {
      console.log('handleServerResponse: ', response);
      this.setState({
        response: response
      })
      console.log("after changing state: ", this.state.response);
    }
  }

  //handle voice button click
  startStopVoiceSearch() {
    var myClient = new Houndify.HoundifyClient(houndifyclient.houndifyClient(this.state.location, this.handleServerResponse.bind(this)));
    if (myClient.voiceSearch.isStreaming()) {
      //stops streaming voice search requests, expects the final response from backend
      myClient.voiceSearch.stop();
    } else {
      myClient.voiceSearch.startRecording(this.requestInfo);
      //starts streaming of voice search requests to Houndify backend
      document.getElementById("voiceIcon").className = "loading circle notched icon big";
      document.getElementById("textSearchButton").disabled = true;
      document.getElementById("query").readOnly = true;
    }
  }
  //handle user text input
  textQuery() {
    var query = document.getElementById('query').value;
    console.log(query);
    console.log(this.state.location)
    $.ajax({
      url: '/voice',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        RawTranscription: query,
        WrittenResponseLong: query,
        location: this.state.location}),
      success: (data) => {
        console.log('text query response from server: ', data.data);
        this.setState({
          response: data
        });
      },
      error: (err) => {
        console.log('err', err);
      }
    });
  }

  render () {
    return (
      <div>
        <div className="ui center aligned basic segment container">
          <ResponseCard response={this.state.response} />
          <form id="form" className="ui form" action="javascript:void(0);">
            <div className="ui action big labeled fluid input field">
              <div className="ui icon basic label button" onClick= {this.startStopVoiceSearch.bind(this)}>
                <i id="voiceIcon" className="unmute big icon"></i>
              </div>
              <input id="query" type="text" placeholder="Click on a microphone icon or type in your query" />
              <button id="textSearchButton" className="ui icon button" onClick= {this.textQuery.bind(this)}>
                 <i className="search big icon"></i>
              </button>
            </div>
            <div className="ui field" hidden>
              <label>Response object</label>
              <textarea id="responseJSON"></textarea>
            </div>
          </form>
        </div>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
