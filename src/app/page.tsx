// src/app/page.tsx
'use client'; // Esto indica que es un componente de cliente, necesario para usar useState, useEffect, etc.

import { useState, useEffect } from 'react';
import Image from 'next/image';

import './globals.css'; // Asegúrate de que este archivo exista y tenga los estilos necesarios

interface RaffleNumber {
    id: number;
    isSold: boolean;
    buyerName: string | null;
    soldAt: string | null;
}

export default function Home() {
    const [numbers, setNumbers] = useState<RaffleNumber[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(new Set());

    // Se ejecuta una vez al cargar el componente para obtener los números de la rifa
    useEffect(() => {
        fetchNumbers();
    }, []);

    const fetchNumbers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/numbers'); // Llama a tu API Route para obtener los números
            if (!response.ok) {
                throw new Error('No se pudieron cargar los números.');
            }
            const data: RaffleNumber[] = await response.json();
            setNumbers(data);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocurrió un error desconocido.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleNumberClick = (numberId: number) => {
        const number = numbers.find(n => n.id === numberId);
        if (number && !number.isSold) {
            setSelectedNumbers(prevSelected => {
                const newSelected = new Set(prevSelected);
                if (newSelected.has(numberId)) {
                    newSelected.delete(numberId);
                } else {
                    newSelected.add(numberId);
                }
                return newSelected;
            });
        }
    };

    // Función para marcar un número como vendido (¡ESTO ES PARA PRUEBAS, REQUIERE SEGURIDAD REAL!)
    const handleSellNumber = async (numberId: number) => {
        const buyerName = prompt(`Ingresa el nombre del comprador para el número ${numberId}:`);
        if (!buyerName) return; // Si cancela

        if (!confirm(`¿Confirmas marcar el número ${numberId} como vendido para ${buyerName}?`)) {
            return;
        }
        try {
            const response = await fetch(`/api/sell/${numberId}`, { // Llama a tu API Route para vender el número
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ buyerName: buyerName }), // Envía el nombre del comprador
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al marcar el número como vendido.');
            }

            alert(`Número ${numberId} marcado como vendido con éxito para ${buyerName}.`);
            await fetchNumbers(); // Vuelve a cargar los números para actualizar la UI
            setSelectedNumbers(prev => {
                const newSelected = new Set(prev);
                newSelected.delete(numberId); // Quitarlo de la selección visual
                return newSelected;
            });
        } catch (err: unknown) {
            if (err instanceof Error) {
                alert(`Error: ${err.message}`);
                console.error('Error al vender número:', err);
            } else {
                alert('Ocurrió un error desconocido.');
                console.error('Error al vender número:', err);
            }
        }
    };

    // Genera el mensaje de WhatsApp con los números seleccionados
    const getWhatsappLink = () => {
        if (selectedNumbers.size === 0) return '#';
        const numbersText = Array.from(selectedNumbers).sort((a, b) => a - b).join(', ');
        const message = `Hola! Quisiera comprar los siguientes números para la rifa de Pandita: ${numbersText}.`;
        const encodedMessage = encodeURIComponent(message);
        // ¡RECUERDA CAMBIAR XXXXXXXXXXX por tu número de WhatsApp! (ej: 56912345678)
        return `https://wa.me/+56966238117?text=${encodedMessage}`;
    };


    return (
        <> {/* Fragment para envolver todo el HTML */}
            <header>
                <div className="header-content">
                    <h1>¡Ayuda a Pandita! ❤️</h1>
                    <p>¡Cada número suma! Juntos podemos darle una patita a su recuperación.</p>
                </div>
            </header>

            <main>
                <section className="pandita-info">
                    <h2>Nuestra querida Pandita necesita tu ayuda</h2>
                        {/* Asegúrate de que estas rutas de imagen sean correctas: /images/panditaX.jpg */}
                        <Image src="/images/pandita1.png" alt="Pandita hospitalizada 1" width={300} height={200} />
                        <Image src="/images/pandita4.png" alt="Pandita hospitalizada 4" width={300} height={200} />
                        <Image src="/images/pandita3.png" alt="Pandita hospitalizada 3" width={300} height={200} /> {/* */}
                    <p>Pandita está actualmente hospitalizada, luchando contra un posible cáncer. Los costos médicos son muy altos y cada aporte es invaluable para su tratamiento y pronta recuperación.</p>
                </section>

                <section className="raffle-details">
                    <h2>Detalles de la Rifa</h2>
                    <div className="details-grid">
                        <div className="detail-item">
                            <h3>Valor del Número</h3>
                            <p>$2.000 CLP</p>
                        </div>
                        <div className="detail-item">
                            <h3>Números Disponibles</h3>
                            <p>¡181 oportunidades para ganar y ayudar!</p>
                        </div>
                        <div className="detail-item">
                            <h3>Gran Premio</h3>
                            <p>$50.000 CLP</p>
                        </div>
                    </div>
                    <p className="motivation">¡Al participar, no solo puedes ganar un fabuloso premio, sino que estarás haciendo una diferencia GIGANTE en la vida de Pandita! ¡Cada número vendido nos acerca más a su salud!</p>
                </section>

                <section className="raffle-numbers">
                    <h2>Selecciona tu Número de la Suerte</h2>
                    {/* Lógica de carga y error para los números */}
                    {loading && <p>Cargando números...</p>}
                    {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                    {!loading && !error && (
                        <div id="numbers-container">
                            {/* Renderiza los números dinámicamente usando el estado 'numbers' */}
                            {numbers.map(num => (
                                <div
                                    key={num.id}
                                    className={`raffle-number ${num.isSold ? 'sold' : ''} ${selectedNumbers.has(num.id) ? 'selected' : ''}`}
                                    onClick={() => handleNumberClick(num.id)}
                                >
                                    {num.id}
                                    {num.isSold && <span className="sold-overlay">VENDIDO</span>}
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="call-to-action">
                        ¡No esperes más! Selecciona tu número, contáctanos para comprarlo y sé parte de esta noble causa.
                    </p>
                    {/* Muestra el resumen de números seleccionados y botón de WhatsApp */}
                    {selectedNumbers.size > 0 && (
                        <div className="selected-summary">
                            <h3>Números seleccionados:</h3>
                            <p>{Array.from(selectedNumbers).sort((a, b) => a - b).join(', ')}</p>
                            <a href={getWhatsappLink()} target="_blank" className="whatsapp-button selected-whatsapp">
                                <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png" alt="WhatsApp Icon" width={24} height={24} /> Comprar números seleccionados
                            </a>
                             {/* Botón de prueba para marcar como vendido (¡Solo para ti en desarrollo, ELIMÍNALO EN PRODUCCIÓN!) */}
                            {Array.from(selectedNumbers).map(numId => (
                                <button key={`sell-${numId}`} onClick={() => handleSellNumber(numId)} className="sell-test-button">
                                    Marcar {numId} como Vendido (TEST)
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                <section className="how-to-participate">
                    <h2>¿Cómo Participar?</h2>
                    <ol>
                        <li>Elige tu número(s) favorito(s) en la cuadrícula de arriba.</li>
                        <li>Haz clic en el número para seleccionarlo.</li>
                        <li>¡Contáctanos a través de WhatsApp para coordinar el pago y confirmar tu(s) número(s)!</li>
                        <li>Una vez confirmado, el número aparecerá como &quot;Vendido&quot;.</li>
                    </ol>
                    <div className="contact-info">
                        <p>¡Envía un WhatsApp para comprar tu número!</p>
                        <a href={getWhatsappLink()} target="_blank" className="whatsapp-button">
                            <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png" alt="WhatsApp Icon" width={24} height={24} /> Contactar por WhatsApp
                        </a>
                        <p className="note">*(Sustituye XXXXXXXXXXX por tu número de teléfono con código de país)*</p>
                    </div>
                </section>
            </main>

            <footer>
                <p>¡Gracias por tu apoyo incondicional a Pandita!</p>
                <p>&copy; 2025 Rifa Solidaria por Pandita</p>
            </footer>
        </>
    );
}