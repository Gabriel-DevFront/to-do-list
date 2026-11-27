
// =================================
// CAPTURANDO OS ELEMENTOS HTML
// =================================

const formulario = document.getElementById('form-tarefa');
const campoTitulo = document.getElementById('titulo');
const campoDescricao = document.getElementById('descricao');
const listaTarefas = document.getElementById('lista-tarefas');
const botaoTema = document.getElementById('botao-tema');

// Endereço da nossa API
const API_URL = 'http://localhost:3000/api/tarefas';

// Armazena o ID da tarefa que está sendo editada
let tarefaEmEdicao = null;


// =================================
// MODO CLARO E MODO ESCURO
// =================================

// Verificando se existe um tema salvo
if (localStorage.getItem('tema') === 'escuro') {
    document.body.classList.add('modo-escuro');
}

// Atualizando o texto do botão
function atualizarBotaoTema() {

    const modoEscuro = document.body.classList.contains('modo-escuro');

    botaoTema.textContent = modoEscuro
        ? '☀️ Modo claro'
        : '🌙 Modo escuro';

}

// Atualiza o botão quando a página abre
atualizarBotaoTema();

// Alternando entre os temas
botaoTema.addEventListener('click', () => {

    document.body.classList.toggle('modo-escuro');

    const modoEscuro = document.body.classList.contains('modo-escuro');

    // Salvando a preferência no navegador
    localStorage.setItem('tema', modoEscuro ? 'escuro' : 'claro');

    atualizarBotaoTema();

});


// =================================
// BUSCAR TAREFAS NA API
// =================================

async function carregarTarefas() {

    try {

        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
            throw new Error('Não foi possível buscar as tarefas.');
        }

        const tarefas = await resposta.json();

        listaTarefas.innerHTML = '';

        tarefas.forEach(tarefa => {

            const item = document.createElement('div');

            item.classList.add('tarefa');

            // Criando os elementos da tarefa
            const titulo = document.createElement('h3');
            titulo.textContent = tarefa.titulo;

            const descricao = document.createElement('p');
            descricao.textContent = tarefa.descricao || 'Sem descrição';

            const status = document.createElement('span');
            status.textContent = tarefa.concluida ? 'Concluída' : 'Pendente';

            // Botão de concluir
            const botaoConcluir = document.createElement('button');

            botaoConcluir.type = 'button';
            botaoConcluir.classList.add('botao-concluir');

            botaoConcluir.textContent = tarefa.concluida
                ? 'Desfazer conclusão'
                : 'Concluir tarefa';

            // Botão de editar
            const botaoEditar = document.createElement('button');

            botaoEditar.type = 'button';
            botaoEditar.classList.add('botao-editar');
            botaoEditar.textContent = 'Editar';

            // Botão de excluir
            const botaoExcluir = document.createElement('button');

            botaoExcluir.type = 'button';
            botaoExcluir.classList.add('botao-excluir');
            botaoExcluir.textContent = 'Excluir';

            // Adicionando os elementos ao cartão
            item.append(
                titulo,
                descricao,
                status,
                botaoConcluir,
                botaoEditar,
                botaoExcluir
            );


            // =================================
            // CONCLUIR OU REABRIR TAREFA
            // =================================

            botaoConcluir.addEventListener('click', async () => {

                try {

                    const resposta = await fetch(`${API_URL}/${tarefa.id}`, {

                        method: 'PUT',

                        headers: {
                            'Content-Type': 'application/json'
                        },

                        body: JSON.stringify({
                            titulo: tarefa.titulo,
                            descricao: tarefa.descricao,
                            concluida: !tarefa.concluida
                        })

                    });

                    if (!resposta.ok) {
                        throw new Error('Não foi possível atualizar a tarefa.');
                    }

                    await carregarTarefas();

                } catch (erro) {

                    console.error('Erro ao atualizar tarefa:', erro);
                    alert('Erro ao alterar o status da tarefa.');

                }

            });


            // =================================
            // EDITAR TAREFA
            // =================================

            botaoEditar.addEventListener('click', () => {

                // Guardando o ID da tarefa
                tarefaEmEdicao = tarefa.id;

                // Preenchendo os campos
                campoTitulo.value = tarefa.titulo;
                campoDescricao.value = tarefa.descricao || '';

                // Alterando o texto do botão
                formulario.querySelector('button[type="submit"]').textContent =
                    'Salvar alterações';

                // Levando o usuário até o formulário
                formulario.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });

            });


            // =================================
            // EXCLUIR TAREFA
            // =================================

            botaoExcluir.addEventListener('click', async () => {

                const confirmar = confirm(
                    `Deseja realmente excluir a tarefa "${tarefa.titulo}"?`
                );

                if (!confirmar) {
                    return;
                }

                try {

                    const resposta = await fetch(`${API_URL}/${tarefa.id}`, {
                        method: 'DELETE'
                    });

                    if (!resposta.ok) {
                        throw new Error('Não foi possível excluir a tarefa.');
                    }

                    // Se a tarefa excluída estava sendo editada
                    if (tarefaEmEdicao === tarefa.id) {

                        tarefaEmEdicao = null;

                        formulario.reset();

                        formulario.querySelector('button[type="submit"]').textContent =
                            'Adicionar tarefa';

                    }

                    alert('Tarefa excluída com sucesso!');

                    await carregarTarefas();

                } catch (erro) {

                    console.error('Erro ao excluir tarefa:', erro);
                    alert('Ocorreu um erro ao excluir a tarefa.');

                }

            });


            // Adicionando o cartão à lista
            listaTarefas.appendChild(item);

        });

    } catch (erro) {

        console.error('Erro ao carregar tarefas:', erro);

    }

}


// Carregar tarefas assim que a página abrir
carregarTarefas();


// =================================
// CADASTRAR OU EDITAR UMA TAREFA
// =================================

formulario.addEventListener('submit', async (evento) => {

    // Impede que a página seja recarregada
    evento.preventDefault();

    // Capturando os valores digitados
    const titulo = campoTitulo.value.trim();
    const descricao = campoDescricao.value.trim();

    if (!titulo) {
        alert('Digite um título para a tarefa.');
        return;
    }

    try {

        let resposta;

        // Verificando se estamos editando uma tarefa
        if (tarefaEmEdicao !== null) {

            resposta = await fetch(`${API_URL}/${tarefaEmEdicao}`, {

                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    titulo: titulo,
                    descricao: descricao,
                    concluida: false
                })

            });

            if (!resposta.ok) {
                throw new Error('Não foi possível editar a tarefa.');
            }

            alert('Tarefa editada com sucesso!');

            tarefaEmEdicao = null;

        } else {

            // Cadastrando uma nova tarefa
            resposta = await fetch(API_URL, {

                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    titulo: titulo,
                    descricao: descricao
                })

            });

            if (!resposta.ok) {
                throw new Error('Não foi possível cadastrar a tarefa.');
            }

            alert('Tarefa cadastrada com sucesso!');

        }

        // Limpando os campos
        formulario.reset();

        // Restaurando o texto do botão
        formulario.querySelector('button[type="submit"]').textContent =
            'Adicionar tarefa';

        // Atualizando a lista
        await carregarTarefas();

    } catch (erro) {

        console.error('Erro ao salvar tarefa:', erro);
        alert('Ocorreu um erro ao salvar a tarefa.');

    }

});
