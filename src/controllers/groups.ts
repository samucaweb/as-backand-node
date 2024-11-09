import { RequestHandler } from "express";
import * as groups from '../services/groups';
import { date, z } from "zod";

export const getAll: RequestHandler = async (req, res) => {
    const { id_event } = req.params;
    const items = await groups.getAll(parseInt(id_event));
    if (items) { res.json({ groups: items }); return }
    res.json({ error: 'Ocorreu um erro' });
}
export const getGroup: RequestHandler = async (req, res) => {
    const { id, id_event } = req.params;
    const groupsItem = await groups.getOne({
        id: parseInt(id),
        id_event: parseInt(id_event)
    });
    if (groupsItem) { res.json({ groups: groupsItem }); return }
    res.json({ error: 'Ocorreu um erro' });
}

export const addGroup: RequestHandler = async (req, res) => {
    const { id_event } = req.params;
    const addGroupSchama = z.object({ name: z.string() })
    const body = addGroupSchama.safeParse(req.body);
    if (!body.success) { res.json({ error: 'Dados inválidos' }); return }
    const newGroup = await groups.add({
        ...body.data,
        id_event: parseInt(id_event)
    });
    if (newGroup) {
        res.status(201).json({ group: newGroup });
        return;
    }
    res.json({ erro: 'Ocorreu um erro' })
}

export const updateGroup: RequestHandler = async (req, res) => {
    const { id_event, id } = req.params;
    const updateGroupSchama = z.object({ name: z.string().optional() });
    const body = updateGroupSchama.safeParse(req.body);
    if (!body.success) { res.status(403).json({ error: 'Dados inválidos' }); return }
    const updatedGroup = await groups.update({
        id: parseInt(id),
        id_event: parseInt(id_event)
    }, body.data);
    if (updatedGroup) {
        res.json({ group: updatedGroup });
        return;
    }
    res.json({ error: 'Ocorreu um erro' });
}
export const deleteGroup: RequestHandler = async (req, res) => {
    const { id, id_event } = req.params;
    const deletedGroup = await groups.remove({
        id: parseInt(id),
        id_event: parseInt(id_event)
    });
    if (deletedGroup) {
        res.json({ group: deletedGroup });
        return;
    }
    res.json({ error: 'Ocorreu um erro' });
}