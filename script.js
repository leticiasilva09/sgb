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
