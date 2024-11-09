import { Prisma, PrismaClient } from "@prisma/client";
import * as events from './events';
import * as  groups from "./groups";

const prisma = new PrismaClient();

type getPeople = { id_event: number, id_group?: number }
export const getAll = async (filters: getPeople) => {
    try {
        return await prisma.eventPeople.findMany({ where: filters })
    } catch (err) { return false }
}

type GetOneFilter = { id_event: number, id_group?: number, id?: number, cpf?: string }
export const getOne = async (filter: GetOneFilter) => {
    try {
        if (!filter.id && !filter.cpf) return false;
        return await prisma.eventPeople.findFirst({ where: filter })
    } catch (err) { return false }
}

type PersonCreateData = Prisma.Args<typeof prisma.eventPeople, 'create'>['data'];
export const add = async (data: PersonCreateData) => {
    try {
        if (!data.id_group) return false;
        const group = await groups.getOne({
            id: data.id_group,
            id_event: data.id_event
        })
        if (!group) return false
        const eventItem = await events.getOneEvent(data.id_event);
        if (!eventItem) return false;

        return await prisma.eventPeople.create({ data })
    } catch (err) { return false }
}

type updateFilters = { id?: number; id_event: number, id_group?: number }
type PersonUpdateData = Prisma.Args<typeof prisma.eventPeople, 'update'>['data'];

export const update = async (filters: updateFilters, data: PersonUpdateData) => {
    try {
        return await prisma.eventPeople.updateMany({ where: filters, data })
    } catch (err) { return false }
}

type deleteFilters = { id: number; id_event?: number, id_group?: number }
export const remove = async (filters: deleteFilters) => {
    try {
        return await prisma.eventPeople.delete({ where: filters });
    } catch (err) { return false }
}