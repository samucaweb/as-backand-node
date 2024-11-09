import { RequestHandler } from "express";
import * as people from '../services/people';
import { date, z } from "zod";
import { decryptMatch } from "../utils/match";

export const getAll: RequestHandler = async (req, res) => {
    const { id_event, id_group } = req.params;
    const items = await people.getAll({
        id_event: parseInt(id_event),
        id_group: parseInt(id_group)
    });
    if (items) { res.json({ people: items }); return }
    res.json({ error: 'Ocorreu um erro' });
}

export const getPerson: RequestHandler = async (req, res) => {
    const { id, id_event, id_group } = req.params;
    const personItem = await people.getOne({
        id: parseInt(id),
        id_event: parseInt(id_event),
        id_group: parseInt(id_group)
    });
    if (personItem) { res.json({ people: personItem }); return }
    res.json({ error: 'Ocorreu um erro' });
}

export const addPerson: RequestHandler = async (req, res) => {
    const { id_event, id_group } = req.params;
    const addPersonSchama = z.object({
        name: z.string(),
        cpf: z.string().transform(val => val.replace(/\.|-/gm, ''))
    })
    const body = addPersonSchama.safeParse(req.body);
    if (!body.success) { res.json({ error: 'Dados inválidos' }); return }
    const newPesron = await people.add({
        ...body.data,
        id_event: parseInt(id_event),
        id_group: parseInt(id_group)
    });
    if (newPesron) {
        res.status(201).json({ group: newPesron });
        return;
    }
    res.json({ erro: 'Ocorreu um erro' })
}

export const updatePerson: RequestHandler = async (req, res) => {
    const { id_event, id_group, id } = req.params;
    const updatePersonSchama = z.object({
        name: z.string().optional(),
        cpf: z.string().transform(val => val.replace(/\.|-/gm, '')).optional(),
        matched: z.string().optional()
    });
    const body = updatePersonSchama.safeParse(req.body);
    if (!body.success) { res.status(403).json({ error: 'Dados inválidos' }); return }
    const updatedPerson = await people.update({
        id: parseInt(id),
        id_event: parseInt(id_event),
        id_group: parseInt(id_group)
    }, body.data);

    if (updatedPerson) {
        const personItem = await people.getOne({
            id: parseInt(id),
            id_event: parseInt(id_event),
        })
        res.json({ people: personItem })
        return;
    }
    res.json({ error: 'Ocorreu um erro' });
}

export const deletePerson: RequestHandler = async (req, res) => {
    const { id, id_event, id_group } = req.params;
    const deletedPerson = await people.remove({
        id: parseInt(id),
        id_event: parseInt(id_event),
        id_group: parseInt(id_group)
    });
    if (deletedPerson) {
        res.json({ person: deletedPerson });
        return;
    }
    res.json({ error: 'Ocorreu um erro' });
}

export const searchPerson: RequestHandler = async (req, res) => {
    const { id_event } = req.params;
    const searchPersonSchame = z.object({
        cpf: z.string().transform(val => val.replace(/\.|-/gm, ''))
    });

    const query = searchPersonSchame.safeParse(req.query);
    if (!query.success) {
        res.json({ erro: 'Dados inválidos' });
        return;
    }
    const personItem = await people.getOne({
        id_event: parseInt(id_event),
        cpf: query.data.cpf
    })

    if (personItem && personItem.matched) {
        const matched = decryptMatch(personItem.matched);

        const persosonMatched = await people.getOne({
            id_event: parseInt(id_event),
            id: matched
        });
        if (persosonMatched) {
            res.json({
                person: {
                    id: personItem.id,
                    name: personItem.name
                },
                personMatched: {
                    id: persosonMatched.id,
                    name: persosonMatched.name
                }
            });
            return
        }
    }

    res.json({ error: 'Ocorreu um erro' });
} 