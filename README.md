# Ecoponto

Site de denúncias de problemas urbanos. A pessoa registra foto, endereço e localização; a equipe acompanha e modera as denúncias.

## Tecnologias
- Frontend estático em HTML, CSS e JavaScript, hospedado no Vercel.
- Supabase Auth, Postgres e Storage para contas, denúncias e fotos privadas.
- MapLibre GL JS com OpenFreeMap/Liberty e dados OpenStreetMap/OpenMapTiles.
- Conversão local de latitude/longitude para UTM com proj4.

## Desenvolvimento local
Requer Python 3 ou outro servidor HTTP estático. Na pasta do projeto, rode:

```powershell
python -m http.server 8765
```

Abra `http://localhost:8765`. A câmera e a localização do navegador precisam de um contexto seguro; `localhost` e HTTPS atendem a esse requisito.

## Configuração
`js/config.js` contém a URL do projeto Supabase e sua chave publicável (`sb_publishable_...`). Essa chave é destinada ao frontend; as políticas RLS do banco são a proteção dos dados. Nunca coloque uma chave `service_role`, `secret` ou senha do banco no navegador ou no repositório.

No início de `js/app.js`:
- `MAPS_KEY` e `MAPTILER_KEY` são opcionais para geocodificação reversa. Podem envolver limites ou cobrança; sem elas, o app usa OpenStreetMap.
- `PAY_LINK`, `PIX_KEY` e `CONTACT_URL` configuram apoio e contato de patrocinadores.

O mapa não exige chave. Atribuição a OpenMapTiles e OpenStreetMap permanece visível; a instância pública do OpenFreeMap não oferece SLA.

## Supabase
1. Habilite o provedor de e-mail em **Authentication > Sign In / Providers**.
2. Em **Authentication > URL Configuration**, defina `https://ecoponto-silvya.vercel.app` como Site URL e permita `http://localhost:8765/**` e `https://ecoponto-silvya.vercel.app/**` em Redirect URLs (confirmação de e-mail e recuperação de senha).
3. Para um banco novo, execute em ordem `supabase/migrations/001_reports.sql`, `002_photo_cleanup.sql`, `003_location_source.sql` e `004_admin_roles.sql` no SQL Editor. No projeto atual, as migrações já foram aplicadas; não é necessário repeti-las.

As migrations criam a tabela `reports`, o bucket privado `report-photos` e políticas RLS. Usuários autenticados podem ver e enviar as próprias denúncias; administradores podem ver e moderar todas. Fotos têm acesso privado e URLs assinadas.

### Promover administrador
A role é lida de `app_metadata.role`, que o usuário não pode alterar pelo site. Execute no SQL Editor do Supabase, substituindo pelo e-mail da conta administrativa:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'email-do-administrador';
```

Depois, saia e entre novamente na conta. Nunca use `user_metadata` para conceder permissões.

## Deploy no Vercel
O projeto é estático e não requer etapa de build. Configure a raiz do projeto como diretório publicado e confirme que `index.html`, `js/config.js`, `css/` e `js/` fazem parte do deploy. Enviar alterações à branch `main` publica uma nova versão se o repositório estiver conectado ao Vercel.

## Fluxo das denúncias
- O login é obrigatório para enviar denúncias.
- A localização pode vir do GPS (precisão máxima aceita de 100 m) ou do alfinete colocado manualmente no mapa.
- A data de criação é gravada pelo Postgres; latitude/longitude e UTM são salvas com a denúncia.
- O filtro do mapa permite exibir todas, somente em análise, somente concluídas ou nenhum marcador.
