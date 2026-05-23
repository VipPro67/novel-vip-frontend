import { getTranslations } from "next-intl/server"

type SiteFooterProps = {
  contactEmail: string
}

export async function SiteFooter({ contactEmail }: SiteFooterProps) {
  const t = await getTranslations("Footer")

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto flex flex-col gap-3 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-start md:justify-between md:gap-8">
        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">{t("title")}</p>
          <p>
            {t("emailLabel")}{" "}
            <a
              href={`mailto:${contactEmail}`}
              className="font-medium text-foreground transition-colors hover:text-primary"
            >
              {contactEmail}
            </a>
          </p>
        </div>
        <p className="max-w-2xl leading-6">{t("disclaimer")}</p>
      </div>
    </footer>
  )
}
