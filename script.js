// ====== NAVEGAÇÃO ======
function mudarAba(idAba, botaoClicado) {
    document.querySelectorAll('.aba').forEach(aba => aba.classList.remove('ativa'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('ativo'));
    
    document.getElementById(idAba).classList.add('ativa');
    botaoClicado.classList.add('ativo');

    if(idAba === 'aba-relatorio') prepararRelatorio();
}

// ====== MÓDULO 1: GRÁFICOS E EVOLUÇÃO ======
let grafico;
let historicoPaciente = JSON.parse(localStorage.getItem('historicoMedidas')) || { labels: [], pesos: [], bfs: [] };

function inicializarGrafico() {
    const ctx = document.getElementById('graficoEvolucao').getContext('2d');
    
    grafico = new Chart(ctx, {
        type: 'line',
        data: {
            labels: historicoPaciente.labels,
            datasets: [
                { label: 'Peso (kg)', data: historicoPaciente.pesos, borderColor: '#064e3b', backgroundColor: 'rgba(6, 78, 59, 0.1)', fill: true, tension: 0.3 },
                { label: '% Gordura', data: historicoPaciente.bfs, borderColor: '#d4af37', backgroundColor: 'transparent', borderDash: [5, 5], tension: 0.3 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function salvarMedida() {
    const peso = document.getElementById('peso-atual').value;
    const bf = document.getElementById('bf-atual').value;
    
    if(!peso || !bf) return alert("Preencha o Peso e o BF atuais.");

    const dataHoje = new Date().toLocaleDateString('pt-PT');
    
    historicoPaciente.labels.push(dataHoje);
    historicoPaciente.pesos.push(parseFloat(peso));
    historicoPaciente.bfs.push(parseFloat(bf));

    localStorage.setItem('historicoMedidas', JSON.stringify(historicoPaciente));
    
    grafico.update();
    alert("Medição registada com sucesso!");
}

function limparHistorico() {
    if(confirm("Tem certeza que deseja apagar o histórico de medidas?")) {
        historicoPaciente = { labels: [], pesos: [], bfs: [] };
        localStorage.setItem('historicoMedidas', JSON.stringify(historicoPaciente));
        grafico.data.labels = [];
        grafico.data.datasets[0].data = [];
        grafico.data.datasets[1].data = [];
        grafico.update();
    }
}

// ====== MÓDULO 2: SIMULADOR DE OCR E INTELIGÊNCIA ======
let sugestoesAtuais = []; // Guarda as sugestões geradas para irem para o PDF

function simularOCR() {
    const btn = document.getElementById('btn-ocr');
    btn.textContent = "A processar com IA...";
    btn.disabled = true;

    // Simula o tempo de leitura de um PDF
    setTimeout(() => {
        // Dados simulados extraídos do "exame"
        const examesExtraidos = [
            { nome: "Glicemia de Jejum", valor: 105, ref: "< 99 mg/dL", ideal: false },
            { nome: "Colesterol LDL", valor: 140, ref: "< 130 mg/dL", ideal: false },
            { nome: "Vitamina D", valor: 18, ref: "> 30 ng/mL", ideal: false },
            { nome: "Triglicerídeos", valor: 110, ref: "< 150 mg/dL", ideal: true }
        ];

        const listaMarcadores = document.getElementById('lista-marcadores');
        const listaSugestoes = document.getElementById('lista-sugestoes');
        
        listaMarcadores.innerHTML = '';
        listaSugestoes.innerHTML = '';
        sugestoesAtuais = [];

        examesExtraidos.forEach(exame => {
            const li = document.createElement('li');
            const classe = exame.ideal ? 'alerta-green' : 'alerta-red';
            li.innerHTML = `<span>${exame.nome}</span> <span class="${classe}">${exame.valor} (Ref: ${exame.ref})</span>`;
            listaMarcadores.appendChild(li);

            // Motor de Sugestões / Acelerador
            if (!exame.ideal) {
                let sugestao = "";
                if(exame.nome === "Glicemia de Jejum") sugestao = "Glicemia basal elevada: Recomenda-se jejum intermitente leve (12h-14h) e remoção de hidratos de carbono simples ao pequeno-almoço.";
                if(exame.nome === "Colesterol LDL") sugestao = "Aumento de perfil lipídico (LDL): Aumentar aporte de ómega 3, azeite extra virgem e prescrever fibra solúvel (psyllium) antes do jantar.";
                if(exame.nome === "Vitamina D") sugestao = "Hipovitaminose D: Sugestão de suplementação de 10.000 UI/dia por 30 dias + exposição solar matinal.";
                
                sugestoesAtuais.push(sugestao);
                const liSug = document.createElement('li');
                liSug.textContent = sugestao;
                listaSugestoes.appendChild(liSug);
            }
        });

        // Adiciona sugestões gerais de luxo
        sugestoesAtuais.push("Higiene do sono: Desligar ecrãs 1h antes de dormir para modular o pico de melatonina e baixar cortisol.");
        const liGeral = document.createElement('li');
        liGeral.textContent = "Higiene do sono: Desligar ecrãs 1h antes de dormir para modular o pico de melatonina e baixar cortisol.";
        listaSugestoes.appendChild(liGeral);

        document.getElementById('resultado-exames').classList.remove('escondido');
        btn.textContent = "Nova Leitura OCR";
        btn.disabled = false;
    }, 2000);
}

// ====== MÓDULO 3: PREPARAÇÃO E EMISSÃO DO RELATÓRIO ======
function prepararRelatorio() {
    // Puxa dados do Paciente
    document.getElementById('out-nome').textContent = document.getElementById('nome-paciente').value || "Nome não informado";
    document.getElementById('out-peso').textContent = document.getElementById('peso-atual').value + " kg";
    document.getElementById('out-pesometa').textContent = document.getElementById('peso-meta').value + " kg";
    document.getElementById('out-bf').textContent = document.getElementById('bf-atual').value + " %";
    document.getElementById('out-bfmeta').textContent = document.getElementById('bf-meta').value + " %";

    // Puxa Dieta
    const divDieta = document.getElementById('out-dieta');
    divDieta.innerHTML = `
        <p><strong>Desjejum:</strong> ${document.getElementById('dieta-cafe').value}</p><br>
        <p><strong>Almoço:</strong> ${document.getElementById('dieta-almoco').value}</p><br>
        <p><strong>Lanche:</strong> ${document.getElementById('dieta-lanche').value}</p><br>
        <p><strong>Jantar:</strong> ${document.getElementById('dieta-jantar').value}</p>
    `;

    // Puxa Sugestões
    const ulRotina = document.getElementById('out-rotina');
    ulRotina.innerHTML = '';
    sugestoesAtuais.forEach(s => {
        const li = document.createElement('li');
        li.textContent = s;
        ulRotina.appendChild(li);
    });
}

function gerarPDF() {
    const elemento = document.getElementById('documento-final');
    const nome = document.getElementById('nome-paciente').value || "Paciente";
    
    const opcoes = {
        margin:       15,
        filename:     `Lumiere_${nome}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opcoes).from(elemento).save();
}

// Inicializa a aplicação
inicializarGrafico();
