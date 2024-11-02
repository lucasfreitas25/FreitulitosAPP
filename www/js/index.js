var db = null;

function geolocationSuccess(position) {
  const fixedLatitude = -15.60833148961609;
  const fixedLongitude = -56.06281015821597;

  const latitudeDifference = fixedLatitude - position.coords.latitude;
  const longitudeDifference = fixedLongitude - position.coords.longitude;

  document.getElementById("latitude").textContent =
    "Latitude: " + latitudeDifference;
  document.getElementById("longitude").textContent =
    "Longitude: " + longitudeDifference;
  document.getElementById("error").textContent = "";
}

function geolocationError(error) {
  document.getElementById("error").textContent =
    "Erro ao obter localização: " + error.message;
  document.getElementById("latitude").textContent = "";
  document.getElementById("longitude").textContent = "";
}

const geolocationOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

function obterLocalizacao() {
  navigator.geolocation.getCurrentPosition(
    geolocationSuccess,
    geolocationError,
    geolocationOptions
  );
}

function capturarImagem(tipo) {
  var sourceType =
    tipo === 0
      ? Camera.PictureSourceType.CAMERA
      : Camera.PictureSourceType.PHOTOLIBRARY;

  navigator.camera.getPicture(onSuccess, onFail, {
    quality: 50,
    destinationType: Camera.DestinationType.DATA_URL,
    sourceType: sourceType,
    allowEdit: false,
    encodingType: Camera.EncodingType.JPEG,
    targetWidth: 800,
    targetHeight: 800,
    saveToPhotoAlbum: false,
  });

  function onSuccess(imageData) {
    var img = document.getElementById("imagem-produto");
    img.src = "data:image/jpeg;base64," + imageData;
    img.style.display = "block";

    img.dataset.imagem = imageData;
  }

  function onFail(message) {
    if (message !== "No Image Selected")
      alert("Erro ao capturar imagem: " + message);
  }
}

ons.ready(function () {
  $("#btt-side-menu").on("click", function () {
    var menu = document.getElementById("side-menu");
    menu.open();
  });

  $("#fab-imagem").on("click", function () {
    capturarImagem();
  });
});

ons.ready(function () {
  fetch("env.json")
    .then((response) => response.json())
    .then((data) => {

      const firebaseConfig = {
        apiKey: data.API_KEY,
        authDomain: data.AUTH_DOMAIN,
        projectId: data.PROJECT_ID,
        storageBucket: data.STORAGE_BUCKET,
        messagingSenderId: data.MESSAGING_SENDER_ID,
        appId: data.APP_ID,
      };

      firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();

      atualizarListaProdutos();
      carregarDadosGeraisLoja();
      obterLocalizacao();
    })
    .catch((error) => {
      console.error("erro ao carregar env.json:", error);
    });
});

function atualizarListaProdutos(done) {
  console.log("Buscando produtos da coleção 'grupo10'...");
  db.collection("grupo10")
    .get()
    .then((querySnapshot) => {
      console.log(`Número de produtos encontrados: ${querySnapshot.size}`);
      $("#lista-produtos").empty();

      if (querySnapshot.size === 0) {
        $("#lista-produtos").append(
          "<p style='text-align: center; margin-top: 20px;'>Nenhum produto cadastrado.</p>"
        );
      }
      else {
        querySnapshot.forEach((doc) => {
          const produto = doc.data();
          const produtoId = doc.id;

          const card = document.createElement("ons-card");
          const col1 = document.createElement("ons-col");
          const col2 = document.createElement("ons-col");
          const row = document.createElement("ons-row");

          col1.setAttribute("width", "30%");
          col2.setAttribute("width", "65%");

          row.appendChild(col1);
          row.appendChild(col2);
          card.appendChild(row);

          const titulo = document.createElement("div");
          titulo.setAttribute("class", "title");
          titulo.textContent = produto.nome;

          const conteudo = document.createElement("div");
          conteudo.setAttribute("class", "content");

          const precoElem = document.createElement("span");
          precoElem.setAttribute("class", "price");
          precoElem.textContent = "R$ " + produto.preco;

          const descricaoElem = document.createElement("p");
          descricaoElem.setAttribute("class", "description");
          descricaoElem.textContent = produto.descricao;

          const lixeira = document.createElement("ons-icon");
          lixeira.setAttribute("icon", "md-delete");
          lixeira.setAttribute(
            "style",
            "color: red; font-size: 32px; float: right; cursor: pointer; margin-top: -40px;"
          );
          lixeira.onclick = function () {
            abrirPopup(produtoId);
          };

          const imagem = document.createElement("img");
          imagem.setAttribute("style", "width: 100%;");
          imagem.src = produto?.imagem;

          col1.appendChild(imagem);

          conteudo.appendChild(precoElem);
          conteudo.appendChild(descricaoElem);

          col2.appendChild(titulo);
          col2.appendChild(conteudo);
          col2.appendChild(lixeira);

          $("#lista-produtos").append(card);
        });

        if (done) {
          done();
        }
      }
    })
    .catch((error) => {
      if (done) {
        done();
      }
      console.error("Erro ao listar os produtos: ", error);
    });
}

let produtoIdParaExcluir = null;

function abrirPopup(produtoId) {
  produtoIdParaExcluir = produtoId;

  ons.notification.confirm({
    title: "Confirmação",
    message: "Tem certeza que deseja excluir este produto?",
    buttonLabels: ["Não", "Sim"],
    cancelable: true,
    callback: function (index) {
      if (index === 1) {
        confirmarExclusao();
      } else {
        produtoIdParaExcluir = null;
      }
    },
  });
}

function fecharPopup() {
  produtoIdParaExcluir = null;
  document.getElementById("confirm-dialog").hide();
}

function confirmarExclusao() {
  if (produtoIdParaExcluir) {
    db.collection("grupo10")
      .doc(produtoIdParaExcluir)
      .delete()
      .then(() => {
        ons.notification.alert("Produto excluído com sucesso!");
        atualizarListaProdutos();
      })
      .catch((error) => {
        console.error("Erro ao excluir o produto: ", error);
        ons.notification.alert("Erro ao excluir o produto. Tente novamente.");
      });
  }
}

function showOnsPopover(target) {
  document.getElementById("popover").show(target);
}

function hideOnsPopover() {
  document.getElementById("popover").hide();
}

document.addEventListener("init", function (event) {
  const page = event.target;

  if (page.id === "cadastro") {
    const form = page.querySelector("#form-cadastro-produto");
    const svgTirarFoto = page.querySelector("#btn_tirar_foto");
    const svgGaleria = page.querySelector("#btn_enviar_imagem");

    svgTirarFoto.addEventListener("click", () => capturarImagem(0));

    svgGaleria.addEventListener("click", () => capturarImagem(1));

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const nome = form.querySelector("#txt-nome").value.trim();
      const descricao = form.querySelector("#txt-descricao").value.trim();
      const preco = form.querySelector("#txt-valor").value.trim();
      const quantidade = form.querySelector("#txt-qtd").value.trim();
      const imagemProduto =
        document.getElementById("imagem-produto").dataset.imagem;

      if (nome && descricao && preco && quantidade) {
        if (imagemProduto){
          const decodedImageLength = (imagemProduto.length * 3) / 4;
  
          if (decodedImageLength > 1048487) {
            ons.notification.alert({
              title: "Atenção",
              message:
                "A imagem selecionada é muito grande. Por favor, escolha uma imagem menor que 1MB.",
            });
            return;
          }
        }

        try {
          const imagemBase64 = imagemProduto ? ('data:image/jpeg;base64,' + imagemProduto) : null;

          const dadosProduto = {
            nome,
            descricao,
            preco,
            quantidade,
            imagem: imagemBase64,
          };

          await db.collection("grupo10").add(dadosProduto);

          ons.notification.toast("Produto cadastrado com sucesso!", {
            timeout: 2000,
            buttonLabel: "OK",
            callback: function () {
              form.reset();
              document.getElementById("imagem-produto").style.display = "none";
              atualizarListaProdutos();
              console.log("Produto cadastrado com sucesso!");
            },
          });

          form.reset();
          document.getElementById("imagem-produto").style.display = "none";
        } catch (error) {
          console.error("Erro ao cadastrar produto: ", error);
          ons.notification.alert({
            title: "Atenção",
            message: "Erro ao cadastrar o produto. Tente novamente.",
          });
        }
      } else {
        ons.notification.alert({
          title: "Atenção",
          message:
            "Por favor, preencha todos os campos obrigatórios e capture uma imagem",
        });
      }
    });
  } else if (page.id === "lista") {
    pullHook = document.querySelector("#ph-refresh-produtos");

    pullHook.onAction = function (done) {
      atualizarListaProdutos(done);
    };

    atualizarListaProdutos();

  } else if (page.id === "plugins") {
    $("#btt-vibrar").on("click", function () {
      vibrate();
    });

    $("#switch-imagem").on("change", function () {
      capturarImagem();
    });
  }

});


function salvarDadosGeraisLoja() {
  const form = document.getElementById("form-loja");
  const dadosLoja = {
    nome: form.querySelector("#txt-nome-loja").value,
    telefone: form.querySelector("#txt-telefone-loja").value,
    endereco: form.querySelector("#txt-endereco-loja").value,
  };

  db.collection("dadosGerais")
    .doc("informacoesLoja")
    .set(dadosLoja)
    .then(() => {
      ons.notification.toast("Dados gerais da loja salvos com sucesso!", {
        timeout: 2000,
        buttonLabel: "OK",
        callback: function () {
          console.log("Dados gerais da loja salvos com sucesso!");
        },
      });
    })
    .catch((error) => {
      console.error("Erro ao salvar os dados gerais da loja: ", error);
      ons.notification.toast("Erro ao salvar os dados da loja. Tente novamente.");
    });
}

function carregarDadosGeraisLoja() {
  db.collection("dadosGerais")
    .doc("informacoesLoja")
    .get()
    .then((doc) => {
      if (doc.exists) {
        const dadosLoja = doc.data();
        document.getElementById("txt-nome-loja").value = dadosLoja.nome;
        document.getElementById("txt-telefone-loja").value = dadosLoja.telefone;
        document.getElementById("txt-endereco-loja").value = dadosLoja.endereco;
      }
    })
    .catch((error) => {
      console.error("Erro ao carregar os dados gerais da loja: ", error);
    });
}