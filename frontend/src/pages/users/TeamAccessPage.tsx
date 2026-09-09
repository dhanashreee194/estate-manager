import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getTeamUsers, type TeamUser } from "../../api/user";
import InviteUserModal from "../../components/InviteUserModal";
import "./customers.css";

export default function TeamAccessPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setUsers(await getTeamUsers());
    } catch (err: any) {
      console.error("Failed to load team users", err);
      setUsers([]);
      setError(err?.response?.data?.message || t("team.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="team-access-page">
      <div className="page-card">
        <div className="team-access-toolbar">
          <h2>{t("team.title")}</h2>
          <button
            type="button"
            className="primary-btn"
            onClick={() => setInviteOpen(true)}
          >
            {t("team.addUser")}
          </button>
        </div>
        <p className="hint">{t("team.hint")}</p>

        {loading && <p className="muted">{t("team.loading")}</p>}
        {error && <p className="customers-error">{error}</p>}

        {!loading && !error && users.length === 0 && (
          <p className="muted">{t("team.empty")}</p>
        )}

        {!loading && users.length > 0 && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t("common.name")}</th>
                  <th>{t("common.email")}</th>
                  <th>{t("team.role")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="role-pill">
                        {t(`roles.${u.role}`, { defaultValue: u.role })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <InviteUserModal
        open={inviteOpen}
        onClose={() => {
          setInviteOpen(false);
          load();
        }}
      />
    </div>
  );
}
