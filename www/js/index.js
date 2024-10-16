//"variáveis globais"
var db = null;

function ligarDesligarLanterna() {
  window.plugins.flashlight.toggle(
      function() {
        if (window.plugins.flashlight.isSwitchedOn()) {
          $("#switch-lanterna").attr("checked","checked");
        }
        else {
          $("#switch-lanterna").removeAttr("checked");
        }
      },
      function() {}, 
      {intensity: 0.3} 
  );
}

function vibrate() {
  const time = document.getElementById('vibrationRange').value;
  navigator.vibrate(time);
}

function handleVibrationRangeChange() {
  const time = document.getElementById('vibrationRange').value;
  document.getElementById('vibrationValue').innerText = time ;
}

function capturarImagem(tipo) {
  var sourceType = tipo === 0 ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.PHOTOLIBRARY;

  navigator.camera.getPicture(onSuccess, onFail, {
      quality: 50,                            
      destinationType: Camera.DestinationType.DATA_URL,  
      sourceType: sourceType,                 
      allowEdit: false,                       
      encodingType: Camera.EncodingType.JPEG, 
      targetWidth: 800,                       
      targetHeight: 800,                      
      saveToPhotoAlbum: false                  
  });

  function onSuccess(imageData) {
      var img = document.getElementById('minhaImagem');
      img.src = "data:image/jpeg;base64," + imageData;
      img.className = "container-flex"
      alert('Imagem capturada com sucesso!');
  }

  function onFail(message) {
      alert('Erro ao capturar imagem: ' + message);
  }
}


ons.ready(function() {

    $("#btt-side-menu").on("click",
      function() {
        var menu = document.getElementById('side-menu');
        menu.open();
      }
    );
    //LATERNA
    $("#fab-lanterna").on("click",
      function() {
        ligarDesligarLanterna();
      }
    );

    $("#fab-imagem").on("click",
      function() {
        capturarImagem();
      }
    );


    //CADASTRAR PRODUTOS
    document.addEventListener('init', function(event) {
      var page = event.target;
    
      if (page.id === 'cadastro') {
        $("#btt-cadastrar-produto").on("click", 
          function() {
            var dados_produto_arr = $("#form-cadastro-produto").serializeArray();
            var dados_produto_obj = {};

            
            dados_produto_arr.forEach(function(item) {
              dados_produto_obj[item.name] = item.value; 
            });
    
            db.collection('produtos').add(dados_produto_obj).then(function() {
              ons.notification.alert('Produto cadastrado com sucesso!');
              document.querySelector("#form-cadastro-produto").reset();
            }).catch(function(error) {
              console.error('Erro ao cadastrar produto: ', error);
              ons.notification.alert('Erro ao cadastrar o produto. Tente novamente.');
            });        
    
          }
        );
      }
    });

    //LISTAR PRODUTOS
    document.addEventListener('init', function(event) {
      var page = event.target;
    
      if (page.id === 'lista') {

        pullHook = document.querySelector("#ph-refresh-produtos");
        
        pullHook.onAction = function(done) {
          atualizarListaprodutos(done);
        };

      }
      else if (page.id === 'plugins') {

        $("#btt-vibrar").on("click",
          function() {
            vibrate();
          }
        );

        $("#switch-lanterna").on("change",
          function() {
            ligarDesligarLanterna();
          }
        );
        $("#switch-imagem").on("change",
          function() {
            capturarImagem();
          }
        );

      }
    });

});



ons.ready(function() {

  // Inicialize o Firebase com as credenciais do seu projeto
  const firebaseConfig = {
    apiKey: "xxxxx",
    authDomain: "xxxxx-tees-xx.com",
    projectId: "xxxxx",
    storageBucket: "xxxxx",
    messagingSenderId: "xxxx",
    appId: "xx"
  };

  firebase.initializeApp(firebaseConfig);

  db = firebase.firestore();

  atualizarListaprodutos();

});

function atualizarListaprodutos(done) {
  // Referência à coleção "produtos"
  db.collection("produtos").get().then((querySnapshot) => {
    $("#lista-produtos").empty(); // Limpar a lista de produtos
    querySnapshot.forEach((doc) => {
      //cria os-card para cada iteração
      var produto = doc.data();
      
      var card = document.createElement("ons-card");
      var titulo = document.createElement("div");
      titulo.setAttribute("class","title");
      titulo.textContent = produto.nome;

      var conteudo = document.createElement("div");
      conteudo.setAttribute("class","content");
      conteudo.textContent = "Preco: " + produto.preco;

      card.appendChild(titulo);
      card.appendChild(conteudo);

      //adiciona o card na lista de produtos
      $("#lista-produtos").append(card);

      if (done) { done(); }

    });
  }).catch((error) => {
    if (done) { done(); }
    console.error("Erro ao listar os produtos: ", error);
  });  
}