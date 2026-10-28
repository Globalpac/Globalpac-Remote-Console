import { ReloadOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Result } from 'antd';
import React from 'react';

interface RepoRequiredPromptProps {
  buildAgainLoading: boolean;
  onBuildAgain: () => void;
}

const RepoRequiredPrompt: React.FC<RepoRequiredPromptProps> = ({
  buildAgainLoading,
  onBuildAgain,
}) => {
  const intl = useIntl();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
      }}
    >
      <Result
        status="warning"
        title={intl.formatMessage({
          id: 'pages.nexus.repoRequired',
          defaultMessage: 'Repository Interaction Required',
        })}
        subTitle={intl.formatMessage({
          id: 'pages.nexus.repoRequiredDesc',
          defaultMessage:
            'Custom client generation is unavailable until the build service accepts this console. Wait a few minutes and try again.',
        })}
        extra={
          <Button
            size="large"
            icon={<ReloadOutlined />}
            loading={buildAgainLoading}
            onClick={onBuildAgain}
          >
            <FormattedMessage
              id="pages.nexus.buildAgain"
              defaultMessage="Build Again"
            />
          </Button>
        }
      />
    </div>
  );
};

export default RepoRequiredPrompt;
