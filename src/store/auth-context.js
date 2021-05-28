import React, { useState, useEffect, useCallback } from 'react';

let logoutTimer; //Global value to maintain the logout timer

const AuthContext = React.createContext({
    token: '',
    isLoggedIn: false,
    login: (token) => {},
    logout: () => {}
});

const calculateRemainingTime = (expirationTime) =>{
    const currentTime = new Date().getTime();
    const adjustedExpiryTime = new Date(expirationTime).getTime();
    
    const remainingDuration = adjustedExpiryTime - currentTime;
    
    return remainingDuration;
};

const retrieveStoredToken = () => {
    const storedToken = localStorage.getItem('token');
    const storedExiprationTime = localStorage.getItem('expirationTime');

    const remainingTime = calculateRemainingTime(storedExiprationTime);

    if(remainingTime < 60000) {
        localStorage.removeItem('token');
        localStorage.removeItem('expirationtime');
        return null;
    }

    return {
        token: storedToken,
        duration: remainingTime
    }
};

export const AuthContextProvider = (props) => {
    const tokenData = retrieveStoredToken();
    let initialToken;

    if(tokenData) {
        initialToken = tokenData.token;
    }

    const [token, setToken] = useState(initialToken);

    const userIsLoggedIn = !!token;
    
    const logoutHandler = useCallback(() => { //added usecallback to avoid multiple reload - avoided infinte loop
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('expirationTime');

        if(logoutTimer) {
            clearTimeout(logoutTimer);
        }
    }, []);

    const loginHandler = (token, expirationTime) => {
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('expirationTime', expirationTime)

        const remainingTime = calculateRemainingTime(expirationTime);
        
        logoutTimer = setTimeout(logoutHandler, remainingTime); //Logout after the timer is expired
    };

    //Used for Auto Login when refreshed...
    useEffect(() => {
        if(tokenData){
            logoutTimer = setTimeout(logoutHandler, tokenData.duration);
        }
    }, [tokenData, logoutHandler]);

    const contextValue = {
        token: token,
        isLoggedIn: userIsLoggedIn,
        login: loginHandler,
        logout: logoutHandler
    };

    return <AuthContext.Provider value={contextValue}>{props.children}</AuthContext.Provider>
};

export default AuthContext;
