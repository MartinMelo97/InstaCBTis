$(document).ready(function(){
	initdb();
	checkUser();
})

var CREATE_TABLE_USERS = "CREATE TABLE IF NOT EXISTS usuarios(id INTEGER PRIMARY KEY AUTOINCREMENT, correo varchar(140) NOT NULL, contra varchar(140) NOT NULL, nombre varchar(140) NOT NULL)";
var CREATE_TABLE_PUBLICACIONES = "CREATE TABLE IF NOT EXISTS publicaciones(id INTEGER PRIMARY KEY AUTOINCREMENT, foto varchar(255) NOT NULL, user_id INTEGER, FOREIGN KEY(user_id) REFERENCES usuarios(id))";
var CREATE_TABLE_COMENTARIOS = "CREATE TABLE IF NOT EXISTS comentarios(id INTEGER PRIMARY KEY AUTOINCREMENT, cuerpo varchar(255) NOT NULL, user_id INTEGER, publicacion_id INTEGER, FOREIGN KEY(user_id) REFERENCES usuarios(id), FOREIGN KEY(publicacion_id) REFERENCES publicaciones(id))";
var SELECT_USUARIOS = "SELECT * FROM usuarios";
var SELECT_PUBLICACIONES = "SELECT * FROM  publicaciones";
var DROP_USUARIOS = "DROP TABLE usuarios";
var DROP_PUBLICACIONES = "DROP TABLE publicaciones";
var GET_NAME_USER = "SELECT * FROM usuarios WHERE id = ?";
var TRAER_IMAGEN = "SELECT * FROM  publicaciones WHERE id = ?";
var GET_COMENTARIOS = "SELECT * FROM comentarios WHERE publicacion_id = ?";
var INSERT_COMENTARIO = "INSERT INTO comentarios(cuerpo, user_id, publicacion_id) values(?,?,?)";
var INSERTAR_USUARIO = "INSERT INTO usuarios(correo, contra, nombre) values(?,?,?)";
var INSERTAR_PUBLICACION = "INSERT INTO publicaciones(foto, user_id) values(?,?)";
var db = openDatabase("InstaCBTis", "1.0", "fkslñfkdslñfkdslñ", "20000000");
var dataset;
var DataType;

function initdb()
{
	try{
		if(!window.openDatabase)
		{
			alert("No se puede");
		}
		else
		{
			crearTabla();
			crearTablaPubli();
			crearTablaComent();
			insertarUsuarios();
			traerUsuarios();
			//droptable();
		}
	}
	catch(e)
	{
		if(e == 2)
		{
			console.log("version invalida");
		}
		else
		{
			console.log("Error desconocido");
		}
	}
}

function droptable(){
	db.transaction(function(tx)
	{
		tx.executeSql(DROP_USUARIOS, []);
	});
}
function crearTabla(){
	db.transaction(function(tx){

		tx.executeSql(CREATE_TABLE_USERS, []);
	});
}

function crearTablaPubli(){
	console.log("Wat");
	db.transaction(function(tx){
		tx.executeSql(CREATE_TABLE_PUBLICACIONES, []);
	});
}

function crearTablaComent(){
	console.log("Frepo");
	db.transaction(function(tx){
		tx.executeSql(CREATE_TABLE_COMENTARIOS, []);
	});
}

function insertarUsuarios(){
	console.log("inserto");
	db.transaction(function(tx)
	{
		tx.executeSql(INSERTAR_USUARIO, ['maria@gmail.com','majo','Majo']);
		tx.executeSql(INSERTAR_USUARIO, ['gibran@gmail.com','gibran','Gibran']);
		tx.executeSql(INSERTAR_USUARIO, ['juan@gmail.com','juan','Juan']);
	});
}

function traerUsuarios(){
	db.transaction(function(tx){
		tx.executeSql(SELECT_USUARIOS, [], function(tx, resultado){
			var rows = resultado.rows;
			for(var x = 0; x < rows.length; x++)
			{
				console.log("Correo: "+rows[x].correo+" Pass: "+rows[x].contra+" nombre: "+rows[x].nombre);
			}
		});
	})
}

$('#btnIngresar').on('click', function(){
	login();
});

function login()
{
	var existe = false;
	var correo = $('#correo').val();
	var contra = $('#contrasena').val();
	db.transaction(function(tx){
		tx.executeSql(SELECT_USUARIOS, [], function(tx, users){
			var registros = users.rows;
			for(var i = 0; i < registros.length; i++)
			{
				if(correo == registros[i].correo)
				{
					if(contra == registros[i].contra)
					{
						existe = true;
						var url = "main.html?id="+registros[i].id+"&nombre="+registros[i].nombre;
						console.log(url);
						window.location.replace(url);
					}
					else
					{
						
					}
				}
				else
				{
				}
			}
			if(existe == false)
			{
				alert("No es posible conectar");
			}
		});
	});
}

function checkUser()
{
	var pathname = window.location.pathname; 
	var arr = pathname.split('/');
	var len = arr.length;
	var pagina = arr[len-1];
	console.log(pagina);
	if(pagina == "main.html" || pagina == "detalle.html")
	{
		console.log("mierda");
		db.transaction(function(tx)
		{
			tx.executeSql(SELECT_PUBLICACIONES, [], function(tx, publicaciones){
				var registros = publicaciones.rows;
				console.log(registros[0]);
				for(var i = 0; i < registros.length; i++)
				{
					nombre = getNameUser(registros[i].user_id);	
					console.log(nombre);
					$('#publicaciones').append('<div class="col l4 m6 s12"><img src="'+registros[i].foto+'" width=200 height=200 class="iraDetalle" id="'+registros[i].id+'"><br><p>'+nombre+'</p></div></a>');
				}
			});
		});
		var arr2 = window.location.href.split('?');
		var data_get = arr2[1].split('&');
		var id = data_get[0].split('=')[1];
		var nombre = data_get[1].split('=')[1];
		console.log(id);
		console.log(nombre);
		$('#datos_usuario').html('<h1 id=useruser data-id='+id+'>Bienvenido(a) '+nombre);

		$('#btnUpload').on('click',function(){
			var downloadURL;
			var storage = firebase.storage();
			var storageRef = storage.ref();
			var file = $('#imagen').prop('files')[0];
			var uploadTask = storageRef.child('publicaciones/' + file.name).put(file);

			 uploadTask.on('state_changed', function(snapshot){
                    console.log("Transferidos: "+ snapshot.bytesTransferred);
                    console.log("Total: "+ snapshot.totalBytes);
                    alert("Transferidos: "+ snapshot.bytesTransferred);
                    alert("Total: "+ snapshot.totalBytes);

                }, function(error){
                    switch(error.code){
                        case 'storage/unauthorized':
                            console.log("No tienes permiso");
                            alert("No tienes permiso");
                        break;
                        case 'storage/canceled':
                            console.log("Usuario canceló la descarga");
							alert("Usuario canceló la descarga");                            
                        break;
                    }
                },
                function(){
                    console.log("Se subio papu");
                    downloadURL = uploadTask.snapshot.downloadURL;
                    alert("Ya me subi");
                    InsertPublicacion(downloadURL);
                });
		});

		db.transaction(function(tx){
			tx.executeSql(GET_COMENTARIOS, [id_publicaciones], function(tx, comentarios)
			{
				comentarios_rows = comentarios.rows;
				console.log("Frepo"+comentarios_rows.length);
				if(comentarios_rows.length > 0)
				{
					for(var i = 0; i < comentarios.rows.length; i++)
					{
						$('#comentarios').append('<div class="col l12 m12 s12"><p>'+comentarios_rows[i].cuerpo+'</p></div>');
					}
				}
				else
				{
					$('#comentarios').text("Aun no hay comentarios, escribe uno");
				}
			});
		});
	}

	if(pagina == "detalle.html")
	{
		console.log("perro");
		var arr2 = window.location.href.split('?');
		var data_get = arr2[1].split('&');
		var id_publicaciones = data_get[2].split('=')[1];
		console.log(id_publicaciones);
		db.transaction(function(tx)
		{
			tx.executeSql(TRAER_IMAGEN, [id_publicaciones], function(tx, publicaciones)
			{
				row = publicaciones.rows;
				console.log(row);
				imagen = row[0].foto;
				console.log(imagen);
				unaputafuncion(imagen);
			});
		});

	}
}

function unaputafuncion(imagen)
{
	$('#imagen_grande').attr("src", imagen);
}
function InsertPublicacion(url)
{
	var user_id = $('#useruser').data('id');
	console.log("El id del user" + user_id);
	db.transaction(function(tx)
	{
		tx.executeSql(INSERTAR_PUBLICACION, [url, user_id]);
		location.reload(true);
	});	
}

$(document).on('click', '.iraDetalle', function(){
	console.log("detalle");
	var id_publicaciones = $(this).attr('id');
	var arr2 = window.location.href.split('?');
	var data_get = arr2[1].split('&');
	var id = data_get[0].split('=')[1];
	var nombre = data_get[1].split('=')[1];
	window.location.assign('detalle.html?id='+id+'&nombre='+nombre+'&id_publicacion='+id_publicaciones);
});

function getNameUser(id)
{
	console.log("entro");
	var nombre;
	db.transaction(function(tx)
	{
		var nombre;
		tx.executeSql(GET_NAME_USER, [id], function(tx, user)
		{
			nombre_array = user.rows;
			console.log(nombre_array[0]);
			this.nombre = nombre_array[0].nombre;
			console.log(nombre);
		});
		console.log("dentro"+nombre);
	});
	//return nombre;
}

$('#btnGotoPublicar').on('click', function(){
	$('#form_upload').fadeIn();
});

$('#btnMandarComentario').on('click', function(){
	var cuerpo = $('#comentario_txt').val();
	var arr2 = window.location.href.split('?');
	var data_get = arr2[1].split('&');
	var id = data_get[0].split('=')[1];
	var id_publicacion = data_get[2].split('=')[1];
	db.transaction(function(tx){
		tx.executeSql(INSERT_COMENTARIO, [cuerpo, id, id_publicacion]);
		location.reload(true);
	});

});