import {
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import {
  App,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Space,
  Table,
  Typography,
} from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import {
  createRemotoMaquina,
  deleteRemotoMaquina,
  getRemotoInstaladores,
  listRemotoMaquinas,
  remotoErrorMessage,
  updateRemotoMaquinaNome,
  type InstaladorLink,
  type RemotoInstaladores,
  type RemotoMaquina,
} from '@/services/rustdesk-console/remoto';

function InstaladorCard({
  title,
  description,
  link,
  downloadLabel,
  missingLabel,
}: {
  title: string;
  description: string;
  link: InstaladorLink | null;
  downloadLabel: string;
  missingLabel: string;
}) {
  return (
    <Card title={title}>
      <Typography.Paragraph type="secondary">{description}</Typography.Paragraph>
      {link ? (
        <Space orientation="vertical">
          <Typography.Text code>{link.name}</Typography.Text>
          <Button href={link.url} target="_blank" rel="noopener noreferrer" icon={<DownloadOutlined />}>
            {downloadLabel}
          </Button>
        </Space>
      ) : (
        <Typography.Text type="secondary">{missingLabel}</Typography.Text>
      )}
    </Card>
  );
}

const RemotoPage: React.FC = () => {
  const intl = useIntl();
  const { message, modal } = App.useApp();
  const text = (id: string, defaultMessage: string) =>
    intl.formatMessage({ id, defaultMessage });

  const [maquinas, setMaquinas] = useState<RemotoMaquina[]>([]);
  const [instaladores, setInstaladores] = useState<RemotoInstaladores | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [instaladoresError, setInstaladoresError] = useState<string | null>(
    null,
  );
  const [id, setId] = useState('');
  const [nome, setNome] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftNome, setDraftNome] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setInstaladoresError(null);
    const [listResult, instaladoresResult] = await Promise.allSettled([
      listRemotoMaquinas(),
      getRemotoInstaladores(),
    ]);
    if (listResult.status === 'fulfilled') {
      setMaquinas(listResult.value);
    } else {
      message.error(
        remotoErrorMessage(
          listResult.reason,
          text('pages.remoto.listError', 'Erro ao listar máquinas'),
        ),
      );
    }
    if (instaladoresResult.status === 'fulfilled') {
      setInstaladores(instaladoresResult.value);
    } else {
      setInstaladores(null);
      setInstaladoresError(
        remotoErrorMessage(
          instaladoresResult.reason,
          text('pages.remoto.instaladoresError', 'Erro ao ler os instaladores'),
        ),
      );
    }
    setLoading(false);
  }, [message, intl]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleCreate() {
    setCreating(true);
    try {
      await createRemotoMaquina({ id, nome });
      setId('');
      setNome('');
      message.success(text('pages.remoto.added', 'Máquina adicionada'));
      await refresh();
    } catch (error) {
      message.error(
        remotoErrorMessage(
          error,
          text('pages.remoto.createError', 'Erro ao gravar máquina'),
        ),
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleRename(maquinaId: string) {
    setSavingId(maquinaId);
    try {
      await updateRemotoMaquinaNome(maquinaId, draftNome);
      setEditingId(null);
      message.success(text('pages.remoto.renamed', 'Nome atualizado'));
      await refresh();
    } catch (error) {
      message.error(
        remotoErrorMessage(
          error,
          text('pages.remoto.updateError', 'Erro ao atualizar máquina'),
        ),
      );
    } finally {
      setSavingId(null);
    }
  }

  function handleDelete(maquina: RemotoMaquina) {
    modal.confirm({
      title: text('pages.remoto.removeTitle', 'Remover máquina'),
      content: intl.formatMessage(
        {
          id: 'pages.remoto.removeDescription',
          defaultMessage:
            'Remover {nome} ({id}) desta lista? O programa instalado no PC não é desinstalado.',
        },
        { nome: maquina.nome, id: maquina.id },
      ),
      okText: text('pages.remoto.removeConfirm', 'Remover'),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteRemotoMaquina(maquina.id);
          message.success(text('pages.remoto.removed', 'Máquina removida'));
          await refresh();
        } catch (error) {
          message.error(
            remotoErrorMessage(
              error,
              text('pages.remoto.deleteError', 'Erro ao remover máquina'),
            ),
          );
        }
      },
    });
  }

  async function handleCopy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      message.success(text('pages.remoto.copied', 'ID copiado'));
    } catch {
      message.error(
        text('pages.remoto.copyFailed', 'Não foi possível copiar'),
      );
    }
  }

  return (
    <PageContainer
      title={text('pages.remoto.title', 'Acesso remoto')}
      content={text(
        'pages.remoto.description',
        'Lista de máquinas e download dos instaladores. Quem está logado baixa o programa e executa no próprio PC. O painel não instala sozinho.',
      )}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <InstaladorCard
            title={text('pages.remoto.equipe.title', 'Equipe')}
            description={text(
              'pages.remoto.equipe.description',
              'Cliente completo, para ligar a outras máquinas.',
            )}
            link={instaladores?.equipe ?? null}
            downloadLabel={text('pages.remoto.download', 'Baixar')}
            missingLabel={text(
              'pages.remoto.missing',
              'Este instalador não está na release latest.',
            )}
          />
        </Col>
        <Col xs={24} lg={12}>
          <InstaladorCard
            title={text('pages.remoto.suporte.title', 'Suporte')}
            description={text(
              'pages.remoto.suporte.description',
              'Cliente externo. Mostra o ID e a senha de uso único. Não liga a outros computadores.',
            )}
            link={instaladores?.suporte ?? null}
            downloadLabel={text('pages.remoto.download', 'Baixar')}
            missingLabel={text(
              'pages.remoto.missing',
              'Este instalador não está na release latest.',
            )}
          />
        </Col>
      </Row>
      {instaladores?.tag ? (
        <Typography.Paragraph type="secondary">
          {intl.formatMessage(
            { id: 'pages.remoto.release', defaultMessage: 'Release {tag}' },
            { tag: instaladores.tag },
          )}
        </Typography.Paragraph>
      ) : null}
      {instaladoresError ? (
        <Typography.Paragraph type="danger">
          {instaladoresError}
        </Typography.Paragraph>
      ) : null}

      <Card
        title={text('pages.remoto.new.title', 'Nova máquina')}
        style={{ marginTop: 16 }}
      >
        <Typography.Paragraph type="secondary">
          {text(
            'pages.remoto.new.description',
            'ID e nome. Sem senha permanente.',
          )}
        </Typography.Paragraph>
        <Form layout="inline" onFinish={() => void handleCreate()}>
          <Form.Item label={text('pages.remoto.id', 'ID')}>
            <Input
              id="remoto-id"
              value={id}
              onChange={(event) => setId(event.target.value)}
              placeholder="123 456 789"
              autoComplete="off"
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>
          <Form.Item label={text('pages.remoto.name', 'Nome')}>
            <Input
              id="remoto-nome"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Ex.: Recepção SJC"
              maxLength={120}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<PlusOutlined />}
              loading={creating}
            >
              {text('pages.remoto.add', 'Adicionar')}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={text('pages.remoto.machines', 'Máquinas')}
        style={{ marginTop: 16 }}
        extra={
          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={() => void refresh()}
            disabled={loading}
            aria-label={text('pages.remoto.refresh', 'Atualizar')}
          >
            {text('pages.remoto.refresh', 'Atualizar')}
          </Button>
        }
      >
        <Table<RemotoMaquina>
          rowKey="id"
          loading={loading}
          dataSource={maquinas}
          pagination={false}
          locale={{
            emptyText: text(
              'pages.remoto.empty',
              'Nenhuma máquina cadastrada.',
            ),
          }}
          columns={[
            {
              title: text('pages.remoto.id', 'ID'),
              dataIndex: 'id',
              render: (value: string) => (
                <Typography.Text code>{value}</Typography.Text>
              ),
            },
            {
              title: text('pages.remoto.name', 'Nome'),
              dataIndex: 'nome',
              render: (value: string, row) =>
                editingId === row.id ? (
                  <Input
                    value={draftNome}
                    onChange={(event) => setDraftNome(event.target.value)}
                    maxLength={120}
                    aria-label={`${text('pages.remoto.name', 'Nome')} ${row.id}`}
                  />
                ) : (
                  value
                ),
            },
            {
              title: text('pages.remoto.actions', 'Ações'),
              key: 'actions',
              align: 'right',
              render: (_, row) => (
                <Space>
                  <Button
                    aria-label={`${text('pages.remoto.copyId', 'Copiar ID')} ${row.id}`}
                    icon={<CopyOutlined />}
                    onClick={() => void handleCopy(row.id)}
                  />
                  {editingId === row.id ? (
                    <Button
                      type="primary"
                      loading={savingId === row.id}
                      onClick={() => void handleRename(row.id)}
                    >
                      {text('pages.remoto.save', 'Salvar')}
                    </Button>
                  ) : (
                    <Button
                      aria-label={`${text('pages.remoto.rename', 'Renomear')} ${row.nome}`}
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingId(row.id);
                        setDraftNome(row.nome);
                      }}
                    />
                  )}
                  <Button
                    danger
                    aria-label={`${text('pages.remoto.removeConfirm', 'Remover')} ${row.nome}`}
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(row)}
                  />
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </PageContainer>
  );
};

export default RemotoPage;
