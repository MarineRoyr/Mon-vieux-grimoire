import React, { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { API_ROUTES, APP_ROUTES } from '../../utils/constants';
import { useUser } from '../../lib/customHooks';
import { storeInLocalStorage } from '../../lib/common';
import { ReactComponent as Logo } from '../../images/Logo.svg';
import styles from './SignIn.module.css';

function SignIn({ setUser }) {
  const navigate = useNavigate();
  const { user, authenticated } = useUser();
  if (user || authenticated) {
    navigate(APP_ROUTES.DASHBOARD);
  }

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ error: false, message: '' });
  const [passwordError, setPasswordError] = useState('');

  const validatePassword = (passwordToValidate) => {
    const passwordRegex = /^(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(passwordToValidate)) {
      return 'Le mot de passe doit contenir au moins 8 caractères et une majuscule';
    }
    return '';
  };

  const handleSubmit = async (action) => {
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }
    setPasswordError('');

    try {
      setIsLoading(true);
      const response = await axios.post(
        action === 'signIn' ? API_ROUTES.SIGN_IN : API_ROUTES.SIGN_UP,
        { email, password },
      );

      if (action === 'signIn') {
        if (response?.data?.token) {
          storeInLocalStorage(response.data.token, response.data.userId);
          setUser(response.data);
          navigate('/');
        } else {
          setNotification({ error: true, message: 'Une erreur est survenue' });
        }
      } else {
        setNotification({ error: false, message: 'Votre compte a bien été créé, vous pouvez vous connecter' });
      }
    } catch (err) {
      setNotification({ error: true, message: err.response?.data?.message || 'Une erreur est survenue' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.SignIn} container`}>
      <Logo />
      <div className={`${styles.Notification} ${notification.error ? styles.Error : ''}`}>
        {notification.message && <p>{notification.message}</p>}
      </div>
      <div className={styles.Form}>
        <label htmlFor="email">
          <p>Adresse email</p>
          <input
            className="form-control"
            type="text"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label htmlFor="password">
          <p>Mot de passe</p>
          <input
            className={`form-control ${passwordError ? 'border-red-500' : ''}`}
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {passwordError && <p className={styles.PasswordError}>{passwordError}</p>}
        </label>
        <div className={styles.Submit}>
          <button
            type="button"
            className="flex justify-center p-2 rounded-md w-1/2 self-center bg-gray-800 text-white hover:bg-gray-700"
            onClick={() => handleSubmit('signIn')}
          >
            {isLoading && <div className="spinner-border" />}
            <span>Se connecter</span>
          </button>
          <span>OU</span>
          <button
            type="button"
            className="flex justify-center p-2 rounded-md w-1/2 self-center bg-gray-800 text-white hover:bg-gray-700"
            onClick={() => handleSubmit('signUp')}
          >
            {isLoading && <div className="spinner-border" />}
            <span>S&apos;inscrire</span>
          </button>
        </div>
      </div>
    </div>
  );
}
SignIn.propTypes = {
  setUser: PropTypes.func.isRequired,
};
export default SignIn;
