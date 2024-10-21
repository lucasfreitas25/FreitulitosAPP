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
      var img = document.getElementById('imagem-produto');
      img.src = "data:image/jpeg;base64," + imageData;
      img.style.display = 'block';

      img.dataset.imagem = imageData;
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

      

});



ons.ready(function() {

  // Inicialize o Firebase com as credenciais do seu projeto

  const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  };

  firebase.initializeApp(firebaseConfig);

  console.log('firebase.storage:', firebase.storage);

  db = firebase.firestore();

  // atualizarListaprodutos();

});

function atualizarListaprodutos(done) {
  console.log("Buscando produtos da coleção 'grupo10'...");
  db.collection("grupo10").get().then((querySnapshot) => {
    console.log(`Número de produtos encontrados: ${querySnapshot.size}`);
    $("#lista-produtos").empty(); // Limpar a lista de produtos

    querySnapshot.forEach((doc) => {
      var produto = doc.data();
      console.log("Produto recuperado:", produto);

      // Cria o cartão do produto
      var card = document.createElement("ons-card");

      // Cria o título do cartão com o nome do produto
      var titulo = document.createElement("div");
      titulo.setAttribute("class", "title");
      titulo.textContent = produto.nome;

      // Cria a área de conteúdo do cartão
      var conteudo = document.createElement("div");
      conteudo.setAttribute("class", "content");

      // Cria elemento para o preço
      var precoElem = document.createElement("p");
      precoElem.textContent = "Preço: " + produto.preco;

      // Cria elemento para a descrição
      var descricaoElem = document.createElement("p");
      descricaoElem.textContent = "Descrição: " + produto.descricao;

      // Adiciona os elementos de preço e descrição ao conteúdo
      conteudo.appendChild(precoElem);
      conteudo.appendChild(descricaoElem);

      // Adiciona o título e o conteúdo ao cartão
      card.appendChild(titulo);
      card.appendChild(conteudo);

      // Adiciona o cartão à lista de produtos
      $("#lista-produtos").append(card);
    });

    if (done) {
      done();
    }
  }).catch((error) => {
    if (done) {
      done();
    }
    console.error("Erro ao listar os produtos: ", error);
  });
}



function showOnsPopover(target) {
    document.getElementById('popover').show(target);
}


function hideOnsPopover() {
    document.getElementById('popover').hide();
}


document.addEventListener('init', function(event) {
  var page = event.target;

  if (page.id === 'cadastro') {
    console.log('Página de cadastro inicializada.');

    var form = page.querySelector("#form-cadastro-produto");
    var svgTirarFoto = page.querySelector("#btn_tirar_foto");
    var svgGaleria = page.querySelector("#btn_enviar_imagem");

    if (svgTirarFoto && svgGaleria) {
      console.log('Elementos SVG encontrados.');

      svgTirarFoto.addEventListener("click", function () {
        console.log("Tirando uma foto!");
        capturarImagem(0);
      });

      svgGaleria.addEventListener("click", function () {
        console.log("Capturando imagem da galeria!");
        capturarImagem(1);
      });
    } else {
      console.error('Elementos SVG não encontrados.');
    }

  form.addEventListener("submit", async function(event) {
    event.preventDefault();

    var nome = form.querySelector("#txt-nome").value.trim();
    var descricao = form.querySelector("#txt-descricao").value.trim();
    var preco = form.querySelector("#txt-valor").value.trim();
    var quantidade = form.querySelector("#txt-qtd").value.trim();
    var imagemProduto = document.getElementById('imagem-produto').dataset.imagem;

    if (nome && descricao && preco && quantidade && imagemProduto) {
        try {
          /*
          // Enviar a imagem para o Firebase Storage
          const storageRef = firebase.storage().ref();
          const imagemRef = storageRef.child(`produtos/${nome}_${Date.now()}.jpg`);
          const snapshot = await imagemRef.putString(imagemProduto, 'base64', { contentType: 'image/jpeg' });

          // Obter a URL pública da imagem
          const imagemURL = await snapshot.ref.getDownloadURL();

          // Criar o objeto com os dados do produto e a URL da imagem
          const dadosProduto = {
            nome,
            descricao,
            preco,
            quantidade,
            imagem: imagemURL
          };
          */

          // Criar o objeto com os dados do produto sem a imagem
          const dadosProduto = {
            nome,
            descricao,
            preco,
            quantidade
          };

            // Salvar os dados no Firestore
            await db.collection('grupo10').add(dadosProduto);

            console.log("Produto cadastrado com sucesso!");
            ons.notification.alert('Produto cadastrado com sucesso!');
            form.reset();
            document.getElementById('imagem-produto').style.display = 'none';

        } catch (error) {
            console.error('Erro ao cadastrar produto: ', error);
            ons.notification.alert('Erro ao cadastrar o produto. Tente novamente.');
        }
    } else {
        ons.notification.alert('Por favor, preencha todos os campos obrigatórios e capture uma imagem.');
    }
});

  }else if (page.id === 'lista') {

    pullHook = document.querySelector("#ph-refresh-produtos");
    
    pullHook.onAction = function(done) {
      atualizarListaprodutos(done);
    };
    atualizarListaprodutos();

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


