import axios, { AxiosError } from 'axios';
import { error } from 'console';
import e, { response } from 'express';
import { exitCode } from 'process';

test('Registrar usuario',async () => {
  const userTest = {
    nombre: "test",
    correo: "test@gmail.com",
    contrasena: "test",
  };
  // Registro
  const response = await axios.post('http://localhost:5000/user/create', userTest);
  const token = response.data.token;
  expect(response.status).toBe(200);
  expect(response.data).toHaveProperty('token');
  expect(response.data).toHaveProperty('usuario');
},1000000);

test ('Crear usuario con correo ya usado', async () => {
  const userTest = {
    nombre: "test",
    correo: "test@gmail.com",
    contrasena: "test",
    headers: {
      'Authorization': ''
    },
  };
  const response = await axios.post('http://localhost:5000/user/create', userTest)
  .catch((error: any) => {
    expect(error.response?.status).toBe(409);
  });
},1000000);


test ('Login usuario correcto', async () => {
  const userTest = {
    correo: "test@gmail.com",
    contrasena: "test",
  };
  const response = await axios.post('http://localhost:5000/user/login', userTest)
  expect(response.status).toBe(200);
  expect(response.data).toHaveProperty('usuario')
  expect(response.data).toHaveProperty('token')
},1000000);


test ('Login usuario incorrecto', async () => {
  const userTest = {
    correo: "test@gmail.com",
    contrasena: "tes",
  };
  try {
    const response = await axios.post('http://localhost:5000/user/login', userTest)
  }
  catch (error: any){
    expect(error.response?.status).toBe(401);
  }
},1000000);

test ('Comprobar usuarios', async() => {
  const responseLogin = await axios.post('http://localhost:5000/user/login', { correo: "test@gmail.com", contrasena: "test"});
  const userGet = {
    headers: {'Authorization': 'Bearer ' + responseLogin.data.token }
  }
  const route = 'http://localhost:5000/user/' + responseLogin.data.usuario.id;
  const responseGet = await axios.get(route, userGet)
  console.log(responseGet.data);
  expect(responseGet.status).toBe(200);
  const responseGetEmail = await axios.get(route + '/email', userGet);
  expect(responseGetEmail.data.email).toBe(responseGet.data.email);
  console.log(responseGet.data);
  const responseGetName = await axios.get(route + '/name', userGet);
  expect(responseGetName.data.nombre).toBe(responseGet.data.nombre);
  console.log(responseGet.data);
  const responseGetAge = await axios.get(route + '/age', userGet);
  expect(responseGetAge.data.edad).toBe(responseGet.data.edad);
  const responseGetSex = await axios.get(route + '/sex', userGet);
  expect(responseGetSex.data.sexo).toBe(responseGet.data.sexo);
  const responserGetDesc = await axios.get(route + '/description', userGet);
  expect(responserGetDesc.data.descripcion).toBe(responseGet.data.descripcion);
  const responserGetPhoto = await axios.get(route + '/photo', userGet);
  expect(responserGetPhoto.data.fotoperfil).toBe(responseGet.data.fotoperfil);
  const responserGetLocation = await axios.get(route + '/location', userGet);
  expect(responserGetLocation.data.idlocalidad).toBe(responseGet.data.idlocalidad);
  const responserGetType = await axios.get(route + '/type', userGet);
  expect(responserGetType.data.tipousuario).toBe(responseGet.data.tipousuario);
  const responserGetPreferences = await axios.get(route + '/preferences', userGet);
  console.log(responseGet.data);
  expect(responserGetPreferences.data.buscasexo).toBe(responseGet.data.buscasexo);
  expect(responserGetPreferences.data.buscaedadmax).toBe(responseGet.data.buscaedadmax);
  expect(responserGetPreferences.data.buscaedadmin).toBe(responseGet.data.buscaedadmin);
  const responseGetId = await axios.get('http://localhost:5000/user/' + responseLogin.data.usuario.correo + '/id', userGet);
  expect(responseGetId.data.id).toBe(responseLogin.data.usuario.id);
  console.log(responseGet.data);
});

test ('Eliminar usuario no autorizado', async () => {
  let token = '';
  const userTest = {
    correo: "test@gmail.com",
    contrasena: "test",
  }; 
  const responseLogin = await axios.post('http://localhost:5000/user/login', userTest);
  token = responseLogin.data.token;
  const response = await axios.delete('http://localhost:5000/user/delete',  { headers: {'Authorization': 'Bearer ' + token + '2' } })
    .catch((error: any) => { 
      expect(error.response?.status).toBe(401);
    });
});

test ('Comprobar token valido', async () => {
  let token = '';
  const userTest = {
    correo: "test@gmail.com",
    contrasena: "test",
  }; 
  const responseLogin = await axios.post('http://localhost:5000/user/login', userTest);
  token = responseLogin.data.token;
  const responseCheck = await axios.get('http://localhost:5000/user/check/token', { headers: {'Authorization': 'Bearer ' + token } });
  expect(responseCheck.status).toBe(200);
  expect(responseCheck.data.valido).toBe(true);
  expect(responseCheck.data).toHaveProperty('valido');
  expect(responseCheck.data).toHaveProperty('usuario');
  console.log(responseCheck.data.usuario);
});

test ('Comprobar token no valido', async () => {
  let token = '';
  const userTest = {
    correo: "test@gmail.com",
    contrasena: "test",
  }; 
  const responseLogin = await axios.post('http://localhost:5000/user/login', userTest);
  token = responseLogin.data.token;
  const responseCheck = await axios.get('http://localhost:5000/user/check/token', { headers: {'Authorization': 'Bearer ' + token  + '2'} })
  .then(() => {
    expect(3).toBe(4);
  })
  .catch ((error: any) => {
    expect(error.response?.status).toBe(401);
    expect(error.response?.data.valido).toBe(false);
  });
});

let idBan = 0;

test ('Comprobar banear usuario', async () => {
  const responseAdmin = await axios.post('http://localhost:5000/user/login', { correo: "admin@loveroom.com", contrasena: "hola1234"});
  const tokenAdmin = responseAdmin.data.token;
  const responseUser = await axios.post('http://localhost:5000/user/login', { correo: "test@gmail.com", contrasena: "test"});
  const idUser = responseUser.data.usuario.id;
  const tokenUser = responseUser.data.token;
  console.log(tokenAdmin);
  console.log(idUser);
  const userBan = {
    id: idUser,
  };
  const headers = {
    headers: {'Authorization': 'Bearer ' + tokenAdmin }
  }
  const responseBan = await axios.patch('http://localhost:5000/user/ban', userBan, headers); 
  expect(responseBan.status).toBe(200);
  
  // Actualiza el id del usuario baneado en los 2 siguienes tests
  idBan = idUser;

  const responseCheck = await axios.get('http://localhost:5000/user/check/token', { headers: {'Authorization': 'Bearer ' + tokenUser } })
  .then(() => {
    expect(3).toBe(4);
  })
  .catch ((error: any) => {
    expect(error.response?.status).toBe(401);
  });

  const responseLogin = await axios.post('http://localhost:5000/user/login', { correo: "test@gmail.com", contrasena: "test"})
  .then(() => {
    expect(3).toBe(4);
  })
  .catch((error: any) => {
    expect(error.response?.status).toBe(403);
  });
  
});


test ('Comprobar desbanear usuario', async () => {

  const responseBan = await axios.post('http://localhost:5000/user/login', { correo: "test@gmail.com", contrasena: "test"})
  .catch((error: any) => {
    expect(error.response?.status).toBe(403);
  })

  const responseAdmin = await axios.post('http://localhost:5000/user/login', { correo: "admin@loveroom.com", contrasena: "hola1234"});
  const tokenAdmin = responseAdmin.data.token;
  const headers = {
    headers: {'Authorization': 'Bearer ' + tokenAdmin }
  }
  const userUnban = {
    id: idBan,
  };
  const responseUnban = await axios.patch('http://localhost:5000/user/unban', userUnban, headers); 
  expect(responseUnban.status).toBe(200);

  const responseLogin = await axios.post('http://localhost:5000/user/login', { correo: "test@gmail.com", contrasena: "test"})
  expect(responseLogin.status).toBe(200);
  const tokenUser = responseLogin.data.token;
  expect(responseLogin.data).toHaveProperty('token');
  expect(responseLogin.data).toHaveProperty('usuario');

  const responseCheck = await axios.get('http://localhost:5000/user/check/token', { headers: {'Authorization': 'Bearer ' + tokenUser } })
  expect(responseLogin.status).toBe(200);
  expect(responseCheck.data.valido).toBe(true);
  expect(responseCheck.data).toHaveProperty('valido');
  expect(responseCheck.data).toHaveProperty('usuario');
});

test ('Ban sin ser admin', async () => {
  const responseUser = await axios.post('http://localhost:5000/user/login', { correo: "test@gmail.com", contrasena: "test"});
  const idUser = responseUser.data.usuario.id;
  const headers = {
    headers: {'Authorization': 'Bearer ' + responseUser.data.token }
  }
  const responseBan = await axios.patch('http://localhost:5000/user/ban', {id: idUser}, headers)
  .catch((error: any) => {
    expect(error.response?.status).toBe(401)
  });

  const responseUnban = await axios.patch('http://localhost:5000/user/unban', {id: idUser}, headers)
  .catch((error: any) => {
    expect(error.response?.status).toBe(401)
  });
  
});

test ('Cambiar contraseña ', async () => {
  const responseUser = await axios.post('http://localhost:5000/user/login', { correo: "test@gmail.com", contrasena: "test"});
  const idUser = responseUser.data.usuario.id;
  const tokenUser = responseUser.data.token;
  const headers = {
    headers: {'Authorization': 'Bearer ' + tokenUser }
  }
  const responseUpdate= await axios.patch('http://localhost:5000/user/update/password', {nuevaContrasena: "nuevaPass", antiguaContrasena: "test"}, headers);
  expect(responseUpdate.status).toBe(200);
  const responseLoginUpdate = await axios.post('http://localhost:5000/user/login', { correo: "test@gmail.com", contrasena: "nuevaPass"});
  expect(responseLoginUpdate.status).toBe(200);
  await axios.post('http://localhost:5000/user/login', { correo: "test@gmail.com", contrasena: "nuevaPass"})
  .catch((error: any) => {
    expect(error.response?.status).toBe(401);
  });
  const responseReset= await axios.patch('http://localhost:5000/user/update/password', {nuevaContrasena: "test", antiguaContrasena: "nuevaPass"}, headers);
  expect(responseUpdate.status).toBe(200);
});

test ('Cambiar contraseña fallo', async () => {
  const responseUser = await axios.post('http://localhost:5000/user/login', { correo: "test@gmail.com", contrasena: "test"});
  const idUser = responseUser.data.usuario.id;
  const tokenUser = responseUser.data.token;
  const headers = {
    headers: {'Authorization': 'Bearer ' + tokenUser }
  }
  const responseUpdate= await axios.patch('http://localhost:5000/user/update/password', {nuevaContrasena: "nuevaPass", antiguaContrasena: "hola"}, headers)
  .catch((error: any) => {
    expect(error.response?.status).toBe(401);
  });
  await axios.patch('http://localhost:5000/user/update/password', {nuevaContrasena: "nuevaPass", antiguaContrasena: ""}, headers)
  .catch((error: any) => {
    expect(error.response?.status).toBe(401);
  });
  await axios.patch('http://localhost:5000/user/update/password', {nuevaContrasena: "nuevaPass"}, headers)
  .catch((error: any) => {
    expect(error.response?.status).toBe(500);
  });
});

test ('Eliminar usuario', async () => {
  let token = '';
  const userTest = {
    correo: "test@gmail.com",
    contrasena: "test",
  };
  const responseLogin = await axios.post('http://localhost:5000/user/login', userTest);
  token = responseLogin.data.token;
  console.log(userTest);
  const response = await axios.delete('http://localhost:5000/user/delete',  { headers: {'Authorization': 'Bearer ' + token } });
  expect(response.status).toBe(200);
  const newLogin = await axios.post('http://localhost:5000/user/login', userTest)
  .then((response: any) => {
    expect(response.status).toBe(401);
  })
  .catch((error: any) => {
    console.log("NO existe el user");
    expect(error.response?.status).toBe(401);
  });
},1000000);



test ('Actualizar usuario', async () => {
  const userTest = {
    nombre: "testUpdate",
    correo: "testUpdate1@gmail.com",
    contrasena: "testUpdate",
  };
  // Registro
  const responseRegister = await axios.post('http://localhost:5000/user/create', userTest);
  const responseLogin = await axios.post('http://localhost:5000/user/login', { correo: "testUpdate1@gmail.com", contrasena: "testUpdate"});
  const token = responseLogin.data.token;
  console.log(responseLogin.data.token);
  const userUpdate = {
    "correo":  "update" + responseLogin.data.usuario.id.toString() + "@test.com",
    "nombre": "prueba",
    "edad": 21,
    "sexo": "H",
    "buscaedadmin": 20,
    "buscaedadmax": 81,
    "buscasexo": "M",
    "descripcion": "esto es una prueba",
    "fotoperfil": "null.jpg",
    "idlocalidad": 0,
  };
  const headers = {
    headers: {'Authorization': 'Bearer ' + token }
  };
  // Update
  const response = await axios.put('http://localhost:5000/user/update', userUpdate, headers);
  expect(response.status).toBe(200);
  const responseLoginUpdate = await axios.post('http://localhost:5000/user/login', { correo: "update" + responseLogin.data.usuario.id + "@test.com", contrasena: "testUpdate"});
  expect(responseLoginUpdate.status).toBe(200);
  console.log(responseLoginUpdate.data.usuario);
  // Delete
  const responseDelete = await axios.delete('http://localhost:5000/user/delete',  { headers: {'Authorization': 'Bearer ' + responseLoginUpdate.data.token } });
  expect(responseDelete.status).toBe(200);
  
}, 1000000);

test ('Actualizar todo menos correo', async () => {
  const userTest = {
    nombre: "testUpdate",
    correo: "testUpdate2@gmail.com",
    contrasena: "testUpdate",
  };
  // Registro
  const responseRegister = await axios.post('http://localhost:5000/user/create', userTest);
  const responseLogin = await axios.post('http://localhost:5000/user/login', { correo: "testUpdate2@gmail.com", contrasena: "testUpdate"});
  const token = responseLogin.data.token;
  console.log(token);
  const userUpdate = {
    "correo":  "testUpdate2@gmail.com",
    "nombre": "prueba",
    "edad": 21,
    "sexo": "H",
    "buscaedadmin": 20,
    "buscaedadmax": 81,
    "buscasexo": "M",
    "descripcion": "esto es una prueba",
    "fotoperfil": "null.jpg",
    "idlocalidad": 0,
  };
  const headers = {
    headers: {'Authorization': 'Bearer ' + token }
  };
  const response = await axios.put('http://localhost:5000/user/update', userUpdate, headers);
  expect(response.status).toBe(200);
  console.log(response);
  const responseLoginUpdate = await axios.post('http://localhost:5000/user/login', { correo: "testUpdate2@gmail.com", contrasena: "testUpdate"});
  expect(responseLoginUpdate.status).toBe(200);
  console.log(responseLoginUpdate.data.usuario);
  const getUser = await axios.get('http://localhost:5000/user/' + responseLoginUpdate.data.usuario.id, { headers: {'Authorization': 'Bearer ' + responseLoginUpdate.data.token } });
  expect(getUser.data.nombre).toBe(userUpdate.nombre);
  expect(getUser.data.descripcion).toBe(userUpdate.descripcion);
  console.log(getUser.data);
  const getDelete = await axios.delete('http://localhost:5000/user/delete', { headers: {'Authorization': 'Bearer ' + responseLoginUpdate.data.token } });
  expect(getDelete.status).toBe(200);
});

