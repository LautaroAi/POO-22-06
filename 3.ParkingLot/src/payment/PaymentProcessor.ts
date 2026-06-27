export class PaymentProcessor {
  static async processPayment(amount: number, method: string = 'card'): Promise<boolean> {
    // Simular procesamiento de pago
    console.log(`Procesando pago de $${amount.toFixed(2)} con ${method}...`);
    // Simular éxito
    await new Promise(resolve => setTimeout(resolve, 300));
    return true;
  }
}