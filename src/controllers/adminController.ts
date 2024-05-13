import { Request, Response } from "express";
import { getSalasUnitariasCount, 
         getSalasSincronizadas, 
         getSalasNoSincronizadas,
         getTotalSalas} from "../db/salas";
import { getPremiumUsers,
         getUsersAge, 
         getUsersLocalidad,
         getNormalUsers,
         getBannedUsers,
         getTotalUsers} from "../db/usuarios";
import { getResolvedReports,
         getUnresolvedReports} from "../db/mensajes"; 

const adminController = {

    getSalasStats: async (req: Request, res: Response): Promise<void> => {
        const salasUnitarias = await getSalasUnitariasCount();
        const salasSincronizadas = await getSalasSincronizadas();
        const salasNoSincronizadas = await getSalasNoSincronizadas();
        const totalSalas = await getTotalSalas();

        const formattedResponse = {
            SalasUnitarias: salasUnitarias,
            SalasSincronizadas: salasSincronizadas,
            SalasNoSincronizadas: salasNoSincronizadas,
            TotalSalas: totalSalas
        }

        res.json(formattedResponse);
    },

    getUsuariosStats: async (req: Request, res: Response): Promise<void> => {
        const premiumUsers = await getPremiumUsers();
        const normalUsers = await getNormalUsers();
        const bannedUsers = await getBannedUsers();
        const totalUsers = await getTotalUsers();

        const formattedResponse = {
            PremiumUsers: premiumUsers,
            NormalUsers: normalUsers,
            BannedUsers: bannedUsers,
            TotalUsers: totalUsers
        }

        res.json(formattedResponse);
    },

    getUsersAgeStats: async (req: Request, res: Response): Promise<void> => {
        const usersAge = await getUsersAge();
        const ageCount: { [edad: number]: number } = {};
        usersAge.forEach((user: { nombre: string; edad: number; }) => {
            const edad = user.edad;
            if (ageCount[edad]) {
                ageCount[edad]++;
            } else {
                ageCount[edad] = 1;
            }
        });
        
        const formattedResponse = Object.entries(ageCount).map(([age, count]) => ({ Age: age, Count: count }));
        res.json(formattedResponse);
       
    },

    getUsersLocalidadStats: async (req: Request, res: Response): Promise<void> => {
        const usersLocalidad = await getUsersLocalidad();
        const localidadCount: { [localidad: string]: number } = {};
        usersLocalidad.forEach((user: { nombre: string; localidad: { nombre: string; }; }) => {
            const localidad = user.localidad.nombre;
            if (localidadCount[localidad]) {
                localidadCount[localidad]++;
            } else {
                localidadCount[localidad] = 1;
            }
        });

        const formattedResponse = Object.entries(localidadCount).map(([localidad, count]) => ({ Localidad: localidad, Count: count }));
        res.json(formattedResponse);
    },

    getReportesStats: async (req: Request, res: Response): Promise<void> => {
        const resolvedReports = await getResolvedReports();
        const unresolvedReports = await getUnresolvedReports();

        const formattedResponse = {
            ResolvedReports: resolvedReports,
            UnresolvedReports: unresolvedReports
        }

        res.json(formattedResponse);
    }

}

export default adminController;