import React, { Component } from 'react';
import 'whatwg-fetch';
import logo from './logo.png';
import Loader from './Loader';
import './App.css';

class App extends Component {
  state = {
    loading: false,
    number: '',
    error: '',
    newNumber: '',
    password: localStorage.getItem('token') || ''
  }
  componentDidMount() {
    this.fetch();
  }
  fetch = async () => {
    try {
      this.setState({
        loading: true
      });
      const res = await fetch(`${process.env.REACT_APP_API_URL}/status`);
      if (res.ok) {
        const json = await res.json();
        this.setState({
          loading: false,
          number: json.number
        })
      } else{
        this.setState({
          loading: false,
          error: true
        })
      }
    } catch(e){
      this.setState({
        error: true
      })
    }
  }
  onSubmit = async() => {
    if (
      this.state.newNumber &&
      this.state.newNumber.startsWith('07') &&
      this.state.newNumber.length === 11
    ) {
      try {
        this.setState({
          validationError: false,
          submitting: true
        });
        const res= await fetch(`${process.env.REACT_APP_API_URL}`, {
          method: 'POST',
          body: JSON.stringify({
            token: this.state.password,
            number: this.state.newNumber
          })
        })
        if (!res.ok) throw Error('error');
        localStorage.setItem('token', this.state.password);
        await this.fetch();
        this.setState({
          submitting: false
        });
      } catch (e) {
        this.setState({
          error: true,
          submitting: false
        })
      }

    } else {
      this.setState({
        submitting: false,
        validationError: true
      })
    }
  }
  onChange = field => e => {
    this.setState({
      [field]: e.target.value
    })
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Update 440111 Redirect {this.state.number && <p>Current number is: {this.state.number}</p>}
          </p>
          {this.state.loading && <p>Loading...</p>}
          {this.state.error && <p style={{color: 'red'}}>An Error Occured please try again</p>}
          {this.state.validationError && <p style={{color: 'red'}}>Invalid phone number. must be 11 digits. </p>}
        </header>
        <Loader show={this.state.submitting}/>
        {!this.state.submitting && <div class="container">
          <div className="row">
            <form className="col s12">
              <div className="row">
                <input placeholder="Password" id="password" value={this.state.password} type="password" onChange={this.onChange('password')}/>
                <label for="first_name">Password</label>
              </div>
              <div className="row">
                <input placeholder="New Number" id="newNumber" value={this.state.newNumber} type="number" onChange={this.onChange('newNumber')}/>
                <label for="newNumber">Change redirect to</label>
              </div>
              <div className="row">
                <a className="waves-effect waves-light btn" href="#" onClick={this.onSubmit}>
                  Update Redirect
                </a>
              </div>
            </form>
          </div>
        </div>}
      </div>
    );
  }
}

export default App;
