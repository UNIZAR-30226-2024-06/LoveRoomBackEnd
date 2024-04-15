import axios, { AxiosError } from 'axios';



/*test('Borrado, get y creacion de un usuario de test',async () => {
  const postData = {
    nombre: "test",
    correo: "test@gmail.com",
    contrasena: "test",
    headers: {
      'Authorization': ''
    },
  };
  //Iniciamos sesion como el usuario de test
  try {
    console.log("Iniciamos sesion como el usuario de test");
    const response = await axios.post('http://localhost:5000/user/login', postData);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('token');
    expect(response.data).toHaveProperty('usuario');
    const token = response.data.token;
    //Al campo postData ponemos el token
    postData.headers.Authorization = `Bearer ${token}`;
    console.log("Ahora se obtiene el id del usuario de test");
    //Ahora para eliminar el usuario de test necesitamos su id
    const user = await axios.get('http://localhost:5000/user/'+postData.correo, postData);
    expect(user.status).toBe(200);
    expect(user.data.correo).toBe(postData.correo);
    expect(user.data.nombre).toBe(postData.nombre);

    console.log("Se elimina el usuario de test");
    //Eliminamos el usuario de test
    const deleteUser = await axios.delete('http://localhost:5000/user/delete', postData);
    console.log(deleteUser.data);
    //Comprobamos que ha sido borrado correctamente
    const noUser = await axios.get('http://localhost:5000/user/'+postData.correo, postData).then()
    .catch(async (error: AxiosError) => {
      expect(error.response?.status).toBe(404);
      console.log("El usuario ha sido eliminado correctamente", error.response?.status);
      //Si la respuesta 404 es que el usuario ha sido eliminado correctamente
      //creamos un usuario
      try {
        console.log("Se crea un usuario de test otra vez");
        const response = await axios.post('http://localhost:5000/user/create', postData);
        console.log(response.data);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('token');
        expect(response.data).toHaveProperty('usuario');
      }catch(error){
        console.log(error);
      }
    });
  }catch(error){
    console.log(error);
  }

},1000000);*/

