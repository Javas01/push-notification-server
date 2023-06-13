// import { messaging } from 'firebase-admin'

// // Node.js e.g via a Firebase Cloud Function
// export const sendMessageToDevice = () => {
//   const message = {
//     data: {
//       type: 'warning',
//       content: 'A new weather warning has been created!'
//     },
//     topic: 'weather'
//   }

//   messaging()
//     .send({
//       data: {},
//       notification: {
//         title: 'title',
//         body: 'body'
//       },
//       token: ''
//     })
//     .then((response) => {
//       console.log('Successfully sent message:', response)
//     })
//     .catch((error) => {
//       console.log('Error sending message:', error)
//     })
// }
