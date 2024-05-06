import { navigate } from "./navigate";
import { fetch } from "./fetch";
import { setCurrentView } from "./changeCurrentView";
import uiMasks from "./uiMasks.json"
import onRender from "./onRender";
import ButtonSimple from "./ButtonSimple";
import Input from "./Input";

export default {
    dynamic: [
        ...uiMasks,
        setCurrentView,
        navigate,
        fetch
    ],
    code: [
        onRender,
        ButtonSimple,
        Input
    ]
}