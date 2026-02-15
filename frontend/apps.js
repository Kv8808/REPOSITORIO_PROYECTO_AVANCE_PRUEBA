function login() {
  fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      username: user.value,
      password: pass.value
    })
  })
  .then(res => res.json())
  .then(data => alert('token recibido'));
}
