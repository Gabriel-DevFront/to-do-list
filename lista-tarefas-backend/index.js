
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Conexão com o Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
);

// Rota inicial
app.get('/', (req, res) => {
    res.json({
        mensagem: 'API de Lista de Tarefas funcionando!'
    });
});

// GET - Consultar tarefas
app.get('/api/tarefas', async (req, res) => {
    const { data, error } = await supabase
        .from('tarefas')
        .select('*');

    if (error) {
        return res.status(500).json({ erro: error.message });
    }

    res.json(data);
});

// POST - Cadastrar tarefas
app.post('/api/tarefas', async (req, res) => {
    const { titulo, descricao } = req.body;

    if (!titulo || !titulo.trim()) {
        return res.status(400).json({
            erro: 'O título é obrigatório.'
        });
    }

    const { data, error } = await supabase
        .from('tarefas')
        .insert([{
            titulo,
            descricao: descricao || '',
            concluida: false
        }])
        .select()
        .single();

    if (error) {
        return res.status(500).json({ erro: error.message });
    }

    res.status(201).json(data);
});

// PUT - Editar tarefas
app.put('/api/tarefas/:id', async (req, res) => {
    const { id } = req.params;
    const { titulo, descricao, concluida } = req.body;

    const { data, error } = await supabase
        .from('tarefas')
        .update({ titulo, descricao, concluida })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return res.status(500).json({ erro: error.message });
    }

    res.json(data);
});

// DELETE - Excluir tarefas
app.delete('/api/tarefas/:id', async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase
        .from('tarefas')
        .delete()
        .eq('id', id);

    if (error) {
        return res.status(500).json({ erro: error.message });
    }

    res.status(204).send();
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
