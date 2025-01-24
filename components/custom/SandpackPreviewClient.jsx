import { ActionContext } from '@/context/ActionContext';
import { SandpackPreview, useSandpack } from '@codesandbox/sandpack-react'
import React, { useContext, useEffect, useRef } from 'react'

const SandpackPreviewClient = ({customActions, height, width}) => {
    const { sandpack } = useSandpack();
    const previewRef = useRef();
    const {action, setAction} = useContext(ActionContext);

    const GetSandpackClient = async () => {
        const client = previewRef.current?.getClient();
        if (client) {
            const result = await client.getCodeSandboxURL();
            if(action?.actionType == 'deploy'){
                window.open('https://'+result?.sandboxId+'.csb.app/');
            }
            else if(action?.actionType == 'export'){
                window?.open(result?.editorUrl)
            }
            // else if(action?.actionType == 'download'){
            //     const link = document.createElement('a');
            //     link.href = 'https://'+result?.sandboxId+'.csb.app/';
            //     link.download = 'index.html';
            //     document.body.appendChild(link);
            //     link.click();
            //     document.body.removeChild(link);
            //     setAction(null);
            // }
        }
    }

    useEffect(() => {
        GetSandpackClient();
    }, [sandpack&&action]);
  return (
    <SandpackPreview ref={previewRef} style={{ height: height, width: width}} showNavigator={true} actionsChildren={customActions} />
  )
}

export default SandpackPreviewClient
