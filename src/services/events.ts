import { Prisma, PrismaClient } from "@prisma/client";
import * as people from './people';
import * as groups from './groups';
import { encryptMatch } from "../utils/match";

const prisma = new PrismaClient();

// Função para obter todos os eventos
export const getAll = async () => {
    try {
        return await prisma.event.findMany(); // Busca todos os registros na tabela 'event'
    } catch (err) {
        return false;
    }
}

// Função para obter um evento específico pelo ID
export const getOneEvent = async (id: number) => {
    try {
        return await prisma.event.findFirst({ where: { id } }); // Busca o primeiro evento com o ID especificado
    } catch (err) {
        return false;
    }
}

// Função para adicionar um novo evento
export const add = async (data: Prisma.EventCreateInput) => {
    try {
        return await prisma.event.create({ data });
    } catch (err) {
        return false;
    }
}

// Função para atualizar um evento existente pelo ID
export const update = async (id: number, data: Prisma.EventUpdateInput) => {
    try {
        return await prisma.event.update({ where: { id }, data });
    } catch (err) {
        return false;
    }
}

// Função para remover um evento pelo ID
export const remove = async (id: number) => {
    try {
        return await prisma.event.delete({ where: { id } });
    } catch (err) {
        return false;
    }
}

// Função para criar combinações de "matches" entre pessoas em um evento
export const doMatches = async (id: number): Promise<boolean> => {
    // Busca o evento pelo ID para verificar se o agrupamento está ativo
    const eventItem = await prisma.event.findFirst({ where: { id }, select: { grouped: true } });
    if (eventItem) {
        // Obtém a lista de pessoas associadas ao evento
        const peopleList = await people.getAll({ id_event: id });
        if (peopleList) {
            let sortedList: { id: number, match: number }[] = []; // Lista para armazenar as correspondências
            let sorteble: number[] = []; // Lista de IDs disponíveis para combinação

            let attempts = 0; // Contador de tentativas
            let maxAttempts = peopleList.length; // Número máximo de tentativas com base no número de pessoas
            let keepTrying = true;

            // Tenta criar as correspondências até atingir o máximo de tentativas ou conseguir combiná-las
            while (keepTrying && attempts < maxAttempts) {
                keepTrying = false;
                attempts++;
                sortedList = [];
                sorteble = peopleList.map(item => item.id); // Inicializa a lista de IDs disponíveis

                for (let i in peopleList) {
                    // Filtra a lista de IDs se o evento estiver configurado para evitar pares do mesmo grupo
                    let sortebleFiltered: number[] = sorteble;
                    if (eventItem.grouped) {
                        sortebleFiltered = sorteble.filter(sortebleItem => {
                            let sorteblePerson = peopleList.find(item => item.id === sortebleItem);
                            return peopleList[i].id_group !== sorteblePerson?.id_group;
                        });
                    }

                    // Verifica se existem IDs disponíveis para combinar com a pessoa atual
                    if (sortebleFiltered.length === 0 || (sortebleFiltered.length === 1 && peopleList[i].id === sortebleFiltered[0])) {
                        keepTrying = true; // Se não há IDs válidos, define keepTrying como true para tentar novamente
                    } else {
                        // Seleciona um índice aleatório da lista de IDs filtrada
                        let sortedIndex = Math.floor(Math.random() * sortebleFiltered.length);
                        // Garante que o ID selecionado não seja o mesmo da pessoa atual
                        while (sortebleFiltered[sortedIndex] === peopleList[i].id) {
                            sortedIndex = Math.floor(Math.random() * sortebleFiltered.length);
                        }

                        // Adiciona a correspondência à lista de combinações
                        sortedList.push({
                            id: peopleList[i].id,
                            match: sortebleFiltered[sortedIndex]
                        });
                        // Remove o ID selecionado da lista de IDs disponíveis
                        sorteble = sorteble.filter(item => item !== sortebleFiltered[sortedIndex]);
                    }
                }
            }

            // Exibe informações de depuração sobre o número de tentativas
            console.log(`ATTEMPTS: ${attempts}`);
            console.log(`Max ATTEMPTS: ${maxAttempts}`);
            console.log(sortedList);

            // Se as tentativas foram bem-sucedidas, salva as correspondências no banco de dados
            if (attempts < maxAttempts) {
                for (let i in sortedList) {
                    await people.update({
                        id: sortedList[i].id,
                        id_event: id
                    }, { matched: encryptMatch(sortedList[i].match) }); // Atualiza o registro da pessoa com a correspondência criptografada
                }
                return true; // Retorna true se as combinações foram feitas com sucesso
            }
        }
    }

    // Retorna false se não foi possível fazer as combinações
    return false;
}
