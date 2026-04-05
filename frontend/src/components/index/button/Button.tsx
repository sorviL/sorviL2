import { useRef, useState } from "react";
import { IndexController } from "../../../assets/javascript/index/IndexController";
import "./Button.scss";

export function Button() {
    const controller = useRef(new IndexController());
    const [clicks, setClicks] = useState(0);

    function handleClick() {
        const next = controller.current.incrementCount();
        setClicks(next);
    }

    function handleReset() {
        const next = controller.current.resetCount();
        setClicks(next);
    }

    return (
        <div className="button-group">
        <button className="btn btn--primary" onClick={handleClick}>
            Clicou {clicks} {clicks === 1 ? "vez" : "vezes"}
        </button>
        <button className="btn btn--secondary" onClick={handleReset}>
            Resetar
        </button>
        </div>
    );
}
