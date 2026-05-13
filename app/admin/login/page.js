import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/server";
import { loginAction } from "./actions";
import styles from "../admin.module.css";

export const metadata = {
  title: "Login interno",
  description: "Login interno para funcionarios autorizados."
};

export default async function AdminLoginPage({ searchParams }) {
  const params = await searchParams;
  const admin = await getCurrentAdmin();

  if (admin) {
    redirect("/admin");
  }

  const errorMessage =
    params?.error === "config"
      ? "Configure ADMIN_USER, ADMIN_PASSWORD e SESSION_SECRET no ambiente do servidor."
      : params?.error === "invalid"
        ? "Usuario ou senha invalidos."
        : "";

  return (
    <div className={styles.loginPage}>
      <section className={styles.loginCard}>
        <span className={styles.eyebrow}>Login interno</span>
        <h1>Acesso de funcionarios</h1>
        <p>
          Entre para organizar drivers, aplicativos internos, guias e tutoriais com seguranca.
        </p>

        {params?.logout ? <div className={styles.notice}>Sessao encerrada.</div> : null}
        {errorMessage ? <div className={styles.error}>{errorMessage}</div> : null}

        <form action={loginAction} className={styles.loginForm}>
          <input type="hidden" name="from" value={params?.from || "/admin"} />
          <label className={styles.field}>
            <span>E-mail</span>
            <input name="username" type="email" autoComplete="username" required />
          </label>
          <label className={styles.field}>
            <span>Senha</span>
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          <button className={styles.submit} type="submit">
            Entrar
          </button>
        </form>

        <ul className={styles.securityList}>
          <li>Credenciais lidas apenas no servidor via variaveis de ambiente.</li>
          <li>Cookie httpOnly assinado, com SameSite strict e seguro em producao.</li>
          <li>Estrutura preparada para varios funcionarios e permissoes.</li>
        </ul>
      </section>
    </div>
  );
}
