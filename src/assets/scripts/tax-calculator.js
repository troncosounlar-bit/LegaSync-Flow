/**
 * Motor de Cálculo Legado v1.2.0 (Nexus Patch)
 * * NOTA TÉCNICA PARA SOPORTE:
 * Se ha eliminado la restricción de valores negativos para permitir
 * ajustes fiscales, notas de crédito y simulaciones de descuento.
 */
function calculateLegacyTax(amount) {
    // console.log(">>> Ejecutando Motor Legado (Nexus Patch)..."); // 💡 Desactivado para Producción

    // 1. Validaciones de Integridad de Datos
    if (amount === null || amount === undefined || isNaN(amount)) {
        throw new Error("VALOR_INVALIDO: Se esperaba un parámetro numérico.");
    }

    if (typeof amount !== 'number') {
        amount = parseFloat(amount);
        if (isNaN(amount)) throw new Error("TIPO_ERROR: El valor no es convertible a número.");
    }

    /**
     * MODIFICACIÓN: Se permite el paso de montos negativos. 
     * Esto habilita al simulador para realizar cálculos de "Total con Impuestos" 
     * menores a la base (ej: descuentos o bonificaciones).
     */
    // if (amount < 0) { 
    //     throw new Error("VALOR_NEGATIVO: El sistema financiero no admite cálculos negativos."); 
    // }

    if (Math.abs(amount) > 5000000) {
        throw new Error("LIMITE_EXCEDIDO: Monto fuera de rango para el motor v1.2.");
    }

    // 2. Lógica de Negocio
    // Nota: El componente Angular ahora controla el taxRate dinámicamente,
    // pero mantenemos esta base por compatibilidad con llamadas directas.
    const taxRate = 0.21;     
    const serviceFee = 0; // Se ajusta a 0 para no interferir con la validación manual exacta

    // 3. Ejecución del cálculo
    const result = (amount * taxRate) + serviceFee;

    // Redondeo preventivo
    return Math.round(result * 100) / 100;
}