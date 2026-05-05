import { motion } from "motion/react";
import { Button } from "../../button/Button";
import warningIllustration from "../../../assets/images/undraw_warning.svg";
import "./RemoveBookModal.scss";

interface RemoveBookModalProps {
    bookTitle: string;
    bookCoverImage: string | null;
    isRemoving: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

export function RemoveBookModal({
    bookTitle,
    bookCoverImage,
    isRemoving,
    onConfirm,
    onClose,
}: RemoveBookModalProps) {
    return (
        <motion.div
            className="remove-book-overlay"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            <motion.div
                className="remove-book-modal"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.9, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
                <img
                    className="remove-book-illustration"
                    src={warningIllustration}
                    alt="Ilustração de alerta"
                />

                <h3 className="remove-book-title">Remover da estante</h3>

                <div className="remove-book-content">
                    {bookCoverImage && (
                        <img
                            className="remove-book-cover"
                            src={bookCoverImage}
                            alt={`Capa de ${bookTitle}`}
                        />
                    )}
                    <p className="remove-book-message">
                        Tem certeza que deseja remover <strong>{bookTitle}</strong> da sua estante?
                    </p>
                </div>

                    <div className="remove-book-actions">
                        <Button
                            label="Cancelar"
                            className="remove-book-action-btn"
                            onClick={onClose}
                            disabled={isRemoving}
                        />
                        <Button
                            label={isRemoving ? "Removendo..." : "Remover"}
                            className="remove-book-action-btn"
                            onClick={onConfirm}
                            disabled={isRemoving}
                            colors={{
                                bg: "var(--color-remove-bg)",
                                color: "var(--color-remove-icon)",
                                border: "var(--color-remove-border)",
                                hoverBg: "var(--color-remove-hover-bg)",
                                activeBg: "var(--color-remove-active-bg)",
                            }}
                        />
                    </div>
            </motion.div>
        </motion.div>
    );
}
