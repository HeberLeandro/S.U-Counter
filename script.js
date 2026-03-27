import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, onSnapshot, getDocs, query, where, collection, addDoc, serverTimestamp, increment } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
apiKey: "AIzaSyChYPaRdyzOeDV66k1YG6Agg_nhdFYB7Zs",
authDomain: "su-counter.firebaseapp.com",
projectId: "su-counter",
storageBucket: "su-counter.firebasestorage.app",
messagingSenderId: "556879859760",
appId: "1:556879859760:web:18ccca9d6a7e17049b1df5",
measurementId: "G-2Z915G8CBH"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const contadorRef = doc(db, "contador", "global");
const contadorEl = document.getElementById("contador");
const som = document.getElementById("somTapa");

let valorAtual = 0;

// 🔄 Atualização em tempo real
onSnapshot(contadorRef, (docSnap) => {
    if (docSnap.exists()) {
    valorAtual = docSnap.data().valor;
    contadorEl.innerText = valorAtual;
    }
});
// 👋 Tapa
const eventosRef = collection(db, "eventos");

window.darTapa = async function () {
  try {
    const agora = new Date();

    const auxDate = agora.toLocaleString().split(', ')[0];

    const dia = auxDate.substring(6,10) + "-" + auxDate.substring(3,5) + "-" + auxDate.substring(0,2);
    const mes = auxDate.substring(6,10) + "-" + auxDate.substring(3,5);
    const ano = auxDate.substring(6,10);

    // 🔥 incrementa contador global (seguro)
    await updateDoc(contadorRef, {
      valor: increment(1)
    });


    await addDoc(eventosRef, {
        tipo: "slap",
        data: serverTimestamp(),
        dia,
        mes,
        ano
    });

    animar();
    som.play();

    carregarGrafico();

    } catch (e) {
      console.error("Erro:", e);
    }
};

// 🔁 Reset
window.resetar = async function () {
  try {
    const agora = new Date();

    const dia = agora.toISOString().split("T")[0];
    const mes = dia.substring(0, 7);

    // 🔄 Zera contador global
    await updateDoc(contadorRef, {
        valor: 0
    });

    // 📝 Registra evento de reset
    await addDoc(eventosRef, {
        tipo: "reset",
        data: serverTimestamp(),
        dia: dia,
        mes: mes
    });

    } catch (e) {
    console.error("Erro ao resetar:", e);
    }
};

// 🎬 Animação
function animar() {
    contadorEl.classList.add("tap");

    setTimeout(() => {
    contadorEl.classList.remove("tap");
    }, 300);
}

let chart = null;

window.carregarGrafico = async function () {
  const tipo = "slap"; //document.getElementById("tipoSelect").value;
  const periodo = document.getElementById("periodoSelect").value;

  const snapshot = await getDocs(eventosRef);

  const contagem = {};

  snapshot.forEach(doc => {
    const data = doc.data();

    if (data.tipo !== tipo) return;

    const chave = data[periodo]; // dia, mes ou ano

    contagem[chave] = (contagem[chave] || 0) + 1;
  });

  montarGrafico(contagem, tipo, periodo);
};

window.addEventListener("load", carregarGrafico);

function montarGrafico(dados, tipo, periodo) {
  const labels = Object.keys(dados).sort();
  const valores = labels.map(l => dados[l]);

  const ctx = document.getElementById("grafico");

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: `${tipo} por ${periodo}`,
        data: valores,
        tension: 0.3
      }]
    }
  });
}

// window.trocarAba = function (aba) {
//   document.getElementById("aba-contador").style.display = "none";
//   document.getElementById("aba-dashboard").style.display = "none";

//   document.getElementById("aba-dashboard").style.display = "none";
//   document.getElementById("aba-" + aba).style.display = "block";
// };