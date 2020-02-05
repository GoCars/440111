import React from 'react';
import logo from './logo.png';
import './App.css';
import {makeStyles, Button as MUIButton,Paper,FormControl, InputLabel, Input, InputAdornment, TextField as MUITextField} from '@material-ui/core';
import styled from 'styled-components';
import clsx from 'clsx';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  margin-bottom: 20;
  padding: 20px;
  justify-content: space-between;
  flex-basis: 20%;
`
const TextField = styled(MUITextField)`
  margin-bottom: 20px;
`;
const useStyles = makeStyles();
const Button = styled(MUIButton)`
  width: 100%;
`

function App() {
  const [amount, setAmount] = React.useState(0);
  const [message, setMessage] = React.useState('');
  const classes = useStyles();
  function paynow() {
    window.open(`https://settleup.starlingbank.com/garyjames15?amount=${amount}&message=${message}`);
  }
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Go Cars <br/>Online Payment
        </p>
        <Paper>
          <Form noValidate autoComplete="off">

          <FormControl fullWidth
            className={clsx(classes.margin, classes.withoutLabel, classes.textField)}
          >
            <InputLabel htmlFor="standard-adornment-amount">Amount</InputLabel>
            <Input
              id="standard-adornment-amount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
            />
          </FormControl>
            <TextField 
              value={message}
              onChange={e => setMessage(e.target.value)}
              id="outlined-basic" label="Optional - Job Reference"/>
          </Form>
          <Button onClick={paynow}>
            Pay Now
          </Button>
        </Paper>
      </header>
    </div>
  );
}

export default App;
