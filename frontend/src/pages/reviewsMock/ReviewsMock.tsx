import React from "react";
import { ReviewViewer } from "../../components/reviewviewer/ReviewViewer";

export function ReviewsMockPage() {
    const mockReviews = [
        {
            id: "r1",
            author: "Ana",
            rating: 5,
            text: "Excelente leitura, recomendo!",
            date: "2026-04-28",
            bookTitle: "A Biblioteca da Meia-Noite",
        },
        {
            id: "r2",
            author: "Carla",
            rating: 3,
            text: "Mauris lacinia lorem turpis, in sagittis dui fringilla aliquam. Quisque id sem eros. Nulla maximus laoreet orci a vehicula. Sed porta fermentum libero, id lacinia urna fermentum sed. Donec mollis tellus sed ex rhoncus, vel blandit tortor feugiat. Nunc tincidunt purus nulla, dignissim efficitur quam luctus eu. Sed elementum sollicitudin sapien, nec blandit augue hendrerit quis. Nunc volutpat turpis id nunc pellentesque, eu bibendum enim consectetur.",
            date: "2026-03-15",
            bookTitle: "O Nome do Vento",
            isSpoiler: true,
        },
    ];

    return (
        <div className="page reviews-mock">
            <h1>Mock: Visualizador de Reviews</h1>
            <div style={{ maxWidth: 880, margin: "24px auto" }}>
                <ReviewViewer reviews={mockReviews} />
            </div>
        </div>
    );
}
