import { useState, useRef, useContext } from 'react';
import { useHistory } from 'react-router-dom';

import classes from './AuthForm.module.css';
import AuthContext from '../../store/auth-context';

const AuthForm = () => {
  const emailInputRef = useRef();
  const passwordInputRef = useRef();
  const history = useHistory();

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const ctx = useContext(AuthContext);

  const switchAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState);
  };

  const submitHandler = (event) => {
    event.preventDefault();

    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;

    setIsLoading(true);

    let url = '';

    if(isLogin) {
      url = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAUv5aAbfmj3W2blyYlJe1RFM7h9zp7LrI';

    } else {
      url = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyAUv5aAbfmj3W2blyYlJe1RFM7h9zp7LrI';
    }

    fetch(url,
      {
        method: 'POST',
        body: JSON.stringify({
            email: enteredEmail,
            password: enteredPassword,
            returnSecureToken: true
          }),
          headers: {
            'Content-Type': 'application/json'
          }
      }).then(res => {        
        setIsLoading(false);
        if(res.ok) {
          return res.json();
        }
        else {
          return res.json().then(data => {
            //show error info - error modal
            //console.log(data);

            let errorMessage = 'Authentication failed';
            if(data && data.error && data.error.message) {
              errorMessage = data.error.message;
            }
            alert(errorMessage);
            throw new Error(errorMessage);
          });
        }
      })
      .then((data) => {
        //console.log(data);
        const expiryTime = new Date(new Date().getTime() + (+data.expiresIn * 1000));

        ctx.login(data.idToken, expiryTime.toISOString());
        history.replace('/');
      })
      .catch((err) => {
        alert(err.message);
      });
    };

  return (
    <section className={classes.auth}>
      <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
      <form onSubmit={submitHandler}>
        <div className={classes.control}>
          <label htmlFor='email'>Your Email</label>
          <input type='email' id='email' required ref={emailInputRef} />
        </div>
        <div className={classes.control}>
          <label htmlFor='password'>Your Password</label>
          <input type='password' id='password' required  ref={passwordInputRef} />
        </div>
        <div className={classes.actions}>
          {!isLoading && <button>{isLogin ? 'Login' : 'Create Account'}</button>}
          {isLoading && <p>Sending Request...</p>}
          <button
            type='button'
            className={classes.toggle}
            onClick={switchAuthModeHandler}
          >
            {isLogin ? 'Create new account' : 'Login with existing account'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AuthForm;
