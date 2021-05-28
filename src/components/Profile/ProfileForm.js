import { useRef, useContext } from 'react';
import { useHistory } from 'react-router-dom'

import AuthContext from '../../store/auth-context';

import classes from './ProfileForm.module.css';

const ProfileForm = () => {
  const newPasswordInputRef = useRef();
  const history = useHistory();

  const ctx = useContext(AuthContext);

  const submitHandler = event => {
    event.preventDefault();

    const enteredzpassword = newPasswordInputRef.current.value;
    
    //Add Validation if needed

    fetch('https://identitytoolkit.googleapis.com/v1/accounts:update?key=AIzaSyAUv5aAbfmj3W2blyYlJe1RFM7h9zp7LrI',
        { method: 'POST',
          body: JSON.stringify({
            idToken:ctx.token,
            password:enteredzpassword,
            returnSecureToken: false
          }),
          headers: {
            'Content-Type': 'applicaiton/json'
          }
        }).then(res => {
          //assumption always success
          history.replace('/');
        })
        //Need to add error handling for proper ode
  };

  return (
    <form className={classes.form} onSubmit={submitHandler}>
      <div className={classes.control}>
        <label htmlFor='new-password'>New Password</label>
        <input type='password' id='new-password' minLength='7' ref={newPasswordInputRef} />
      </div>
      <div className={classes.action}>
        <button>Change Password</button>
      </div>
    </form>
  );
}

export default ProfileForm;
