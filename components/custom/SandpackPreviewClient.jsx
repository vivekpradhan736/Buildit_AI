import { ActionContext } from '@/context/ActionContext';
import { SandpackPreview, useSandpack } from '@codesandbox/sandpack-react';
import React, { useContext, useEffect, useRef } from 'react';

const SandpackPreviewClient = ({ customActions, height = '80vh', width = '100%' }) => {
  const { sandpack } = useSandpack();
  const previewRef = useRef();
  const { action } = useContext(ActionContext);

  const GetSandpackClient = async () => {
    const client = previewRef.current?.getClient();
    if (client) {
      const result = await client.getCodeSandboxURL();
      if (action?.actionType === 'deploy') {
        window.open(`https://${result?.sandboxId}.csb.app/`, '_blank');
      } else if (action?.actionType === 'export') {
        window.open(result?.editorUrl, '_blank');
      }
      // else if (action?.actionType === 'download') {
      //   const link = document.createElement('a');
      //   link.href = `https://${result?.sandboxId}.csb.app/`;
      //   link.download = 'index.html';
      //   document.body.appendChild(link);
      //   link.click();
      //   document.body.removeChild(link);
      // }
    }
  };

  useEffect(() => {
    GetSandpackClient();
  }, [sandpack, action]);

  return (
    <div className="relative w-full">
      <SandpackPreview
        ref={previewRef}
        showNavigator
        actionsChildren={customActions}
        style={{
          height,
          width,
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      />
    </div>
  );
};

export default SandpackPreviewClient;
