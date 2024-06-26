import { Request, Response, NextFunction } from 'express';
import { updateType } from '../db/usuarios';
import braintree  from 'braintree';

// Configuración de la pasarela Braintree
const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID ?? '',
    publicKey: process.env.BRAINTREE_PUBLIC_KEY ?? '',
    privateKey: process.env.BRAINTREE_PRIVATE_KEY ?? ''
});

const PagosController = {
    generarEnlacePago: async(req: Request, res: Response): Promise<any> => {
        try {
            const idUser = req.body.idUser;
            // Generar un token de cliente
            const clientToken = "56";
      
            const response = {
              success: true,
              clientToken: clientToken
            };
            return res.json(response);

          } catch (error) {
            console.error('Error al generar el enlace de pago:', error);
            const response = {
              success: false,
              error: 'Error al generar el enlace de pago'
            };
            return res.json(response);
          }
    },

    crearPago: async(req: Request, res: Response): Promise<any> => {
        const idUser = req.body.idUser;
        const amount = req.body.amount;
        const paymentMethodNonce = req.body.paymentMethodNonce;
        try {
            // Realizar el pago utilizando el nonce del método de pago
            const result = {success: true, transaction: {id: "123456"},message: "Error al procesar el pago"};
            console.log('Id de usuario:', idUser);
            if (result.success) {
              // El pago se realizó con éxito
              console.log('Pago realizado con éxito');
              const user = await updateType(idUser, "premium");
              const response = {
                success: true,
                transactionId: result.transaction.id
              };
              return res.json(response);
            } else {
              // El pago falló
              const response = {
                success: false,
                error: result.message
              };
              return res.json(response);
            }
            
        } catch (error) {
            console.error('Error al procesar el pago:', error);
            const response = {
              success: false,
              error: 'Error al procesar el pago'
            };
            return res.json(response);
        }
    }
}

export default PagosController
