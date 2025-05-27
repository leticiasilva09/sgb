// função para exibir a aba selecionada e ocultar as demais
function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
  document.getElementById(tabId).style.display = 'block';
}

// funções utilitárias para obter e salvar dados no localStorage
const getData = key => JSON.parse(localStorage.getItem(key)) || [];
const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// cadastra um novo livro e salva no localStorage
function cadastrarLivro() {
  const livro = {
    titulo: livroTitulo.value,
    autor: livroAutor.value,
    isbn: livroISBN.value,
    ano: livroAno.value,
    qtd: parseInt(livroQtd.value),
  };

  const livros = getData('livros');
  livros.push(livro);
  setData('livros', livros);

  alert('Livro cadastrado!');
  document.getElementById('livroTitulo').value = '';
  document.getElementById('livroAutor').value = '';
  document.getElementById('livroISBN').value = '';
  document.getElementById('livroAno').value = '';
  document.getElementById('livroQtd').value = '';
}

// cadastra um novo usuário e salva no localStorage
function cadastrarUsuario() {
  const usuario = {
    nome: usuarioNome.value,
    matricula: usuarioMatricula.value,
    curso: usuarioCurso.value,
  };

  const usuarios = getData('usuarios');
  usuarios.push(usuario);
  setData('usuarios', usuarios);

  alert('Usuário cadastrado!');
  document.getElementById('usuarioNome').value = '';
  document.getElementById('usuarioMatricula').value = '';
  document.getElementById('usuarioCurso').value = '';
}

// realiza o empréstimo de um livro, se estiver disponível e se o usuário não tiver excedido o limite
function realizarEmprestimo() {
  const matricula = matriculaEmprestimo.value;
  const isbn = isbnEmprestimo.value;

  const livros = getData('livros');
  const emprestimos = getData('emprestimos');

  const livro = livros.find(l => l.isbn === isbn);
  const usuarioEmprestimos = emprestimos.filter(e => e.matricula === matricula && !e.dataDevolucao);

  // verifica se o livro está disponível
  if (!livro || livro.qtd <= 0) return alert('Livro não disponível.');

  // verifica se o usuário já tem 3 livros emprestados
  if (usuarioEmprestimos.length >= 3) return alert('Limite de 3 livros por usuário.');

  // atualiza a quantidade disponível do livro
  livro.qtd--;

  // registra o empréstimo com data de empréstimo e data prevista de devolução (7 dias)
  emprestimos.push({
    isbn,
    matricula,
    dataEmprestimo: new Date().toISOString(),
    dataPrevista: new Date(Date.now() + 7 * 86400000).toISOString(),
  });

  setData('livros', livros);
  setData('emprestimos', emprestimos);

  alert('Empréstimo realizado!');
  document.getElementById('matriculaEmprestimo').value = '';
  document.getElementById('isbnEmprestimo').value = '';
}

// realiza a devolução de um livro, verifica se está atrasado e atualiza os dados
function realizarDevolucao() {
  const matricula = matriculaDevolucao.value;
  const isbn = isbnDevolucao.value;

  const emprestimos = getData('emprestimos');
  const livros = getData('livros');

  // busca o empréstimo ativo (sem devolução) do livro pelo usuário
  const emprestimo = emprestimos.find(e => e.isbn === isbn && e.matricula === matricula && !e.dataDevolucao);

  if (!emprestimo) return alert('Empréstimo não encontrado.');

  // define a data de devolução como a data atual
  emprestimo.dataDevolucao = new Date().toISOString();

  // aumenta a quantidade do livro devolvido
  const livro = livros.find(l => l.isbn === isbn);
  if (livro) livro.qtd++;

  setData('emprestimos', emprestimos);
  setData('livros', livros);

  // verifica se houve atraso na devolução
  alert(new Date(emprestimo.dataDevolucao) > new Date(emprestimo.dataPrevista)
    ? 'Devolução com atraso!'
    : 'Livro devolvido com sucesso.');

  document.getElementById('matriculaDevolucao').value = '';
  document.getElementById('isbnDevolucao').value = '';
}

// lista os livros emprestados e exibe o nome do usuário e título do livro
function listarEmprestados() {
  const emprestimos = getData('emprestimos').filter(e => !e.dataDevolucao);
  const livros = getData('livros');
  const usuarios = getData('usuarios');

  const saida = emprestimos.map(e => {
    const livro = livros.find(l => l.isbn === e.isbn);
    const usuario = usuarios.find(u => u.matricula === e.matricula);
    return `${livro?.titulo} - ${usuario?.nome} (${usuario?.matricula})`;
  }).join('\n') || 'Nenhum livro emprestado.';

  saidaRelatorio.textContent = saida;
}

// lista os usuários com empréstimos em atraso
function listarAtrasados() {
  const hoje = new Date();
  const emprestimos = getData('emprestimos').filter(e =>
    !e.dataDevolucao && new Date(e.dataPrevista) < hoje
  );
  const usuarios = getData('usuarios');

  const saida = emprestimos.map(e => {
    const usuario = usuarios.find(u => u.matricula === e.matricula);
    return `${usuario?.nome} (${usuario?.matricula}) - Atrasado`;
  }).join('\n') || 'Nenhum usuário com atraso.';

  saidaRelatorio.textContent = saida;
}

// lista os livros disponíveis para empréstimo
function listarDisponiveis() {
  const livros = getData('livros').filter(l => l.qtd > 0);

  const saida = livros.map(l => `${l.titulo} - ${l.qtd} disponível(is)`).join('\n') || 'Nenhum livro disponível.';

  saidaRelatorio.textContent = saida;
}

// função que limpa todos os dados do sistema (livros, usuários e empréstimos)
function limparDados() {
  if (confirm('Tem certeza que deseja apagar todos os dados?')) {
    localStorage.clear();
    alert('Todos os dados foram apagados.');
    location.reload(); // recarrega a página para atualizar a interface
  }
}

// mostra a aba "livros" por padrão ao carregar o sistema
showTab('livros');


let tipoUsuario = ''; // 'admin' ou 'estudante'

// credenciais fixas para simulação
const credenciais = {
  admin: { usuario: 'admin', senha: 'admin123' },
  estudante: { usuario: 'aluno', senha: 'aluno123' },
};

// funções da tela inicial
function escolherTipo(tipo) {
  tipoUsuario = tipo;
  document.getElementById('inicio').style.display = 'none';
  document.getElementById('login').style.display = 'block';

  // limpa os campos de login sempre que a tela aparecer
  document.getElementById('loginUsuario').value = '';
  document.getElementById('loginSenha').value = '';
}

window.onload = function() {
  document.getElementById('btnVoltarInicio').style.display = 'none';
}

// login
function fazerLogin() {
  const usuario = loginUsuario.value;
  const senha = loginSenha.value;

  if (
    usuario === credenciais[tipoUsuario].usuario &&
    senha === credenciais[tipoUsuario].senha
  ) {
    // esconde tela de login
    document.getElementById('login').style.display = 'none';
    // mostra sistema
    document.getElementById('sistema').style.display = 'block';
    // mostra botão voltar
    document.getElementById('btnVoltarInicio').style.display = 'flex';
    
    resetarAcesso();
    ajustarAcesso();
    showTab(tipoUsuario === 'admin' ? 'livros' : 'usuarios');
  } else {
    alert('Usuário ou senha inválidos!');
  }
}

function resetarAcesso() {
  document.querySelector("button[onclick=\"showTab('livros')\"]").style.display = 'inline-block';
  document.querySelector("button[onclick=\"showTab('emprestimos')\"]").style.display = 'inline-block';
  document.querySelector("button[onclick=\"showTab('relatorios')\"]").style.display = 'inline-block';
}

// limita abas se for estudante
function ajustarAcesso() {
  if (tipoUsuario === 'estudante') {
    document.querySelector("button[onclick=\"showTab('livros')\"]").style.display = 'none';
    document.querySelector("button[onclick=\"showTab('emprestimos')\"]").style.display = 'none';
    document.querySelector("button[onclick=\"showTab('relatorios')\"]").style.display = 'none';
  }
}

function voltarParaInicio() {
  tipoUsuario = '';
  document.getElementById('sistema').style.display = 'none';
  document.getElementById('login').style.display = 'none';
  document.getElementById('inicio').style.display = 'block';
  document.getElementById('btnVoltarInicio').style.display = 'none';

  // limpa os campos de login
  document.getElementById('loginUsuario').value = '';
  document.getElementById('loginSenha').value = '';
}

// utiliza a tecla enter pra pular as caixas de texto
document.querySelectorAll('input').forEach((input, index, inputs) => {
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const next = inputs[index + 1];
      if (next) {
        next.focus();
      }
    }
  });
});

// faz com que o botão seja "clicado" ao apertar enter, sem precisar fazer manualmente com o mouse
document.getElementById('loginSenha').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    fazerLogin();
  }
});

document.getElementById('loginUsuario').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    document.getElementById('loginSenha').focus();
  }
});

