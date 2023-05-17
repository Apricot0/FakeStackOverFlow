import React from 'react';
import model from '../../models/model'
import axios from 'axios'

axios.defaults.withCredentials = true;


const UserComponent = ({ user }) => {
    const memberDate = new Date(user.create_date);
    let durationMessage = model.dateFormat(memberDate);
  return (
    <div>
      <h3>User Information</h3>
      <p>Username: {user.username}</p>
      <p>Email: {user.account_name}</p>
      <p>Role: {user.role}</p>
      <p>reputation: {user.reputation}</p>
      <p>has been member: {durationMessage}</p>
    </div>
  );
};

export default UserComponent;