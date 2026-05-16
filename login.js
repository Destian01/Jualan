let users = JSON.parse(
  localStorage.getItem("users")
);

if(!users){

  users = [
    {
      username: "admin",
      password: "123",
      role: "admin"
    }
  ];

  localStorage.setItem(
    "users",
    JSON.stringify(users)
  );

}

function login(){

  const username =
    document.getElementById("username").value.trim();

  const password =
    document.getElementById("password").value.trim();

  const user = users.find(u =>

    u.username === username &&
    u.password === password

  );

  if(!user){

    alert("Username atau password salah");

    return;
  }

  localStorage.setItem(
  "loginUser",
  JSON.stringify(user)
);
alert("Login berhasil");
location.replace("index.html");
}
