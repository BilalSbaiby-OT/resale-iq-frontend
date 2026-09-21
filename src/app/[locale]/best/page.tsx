import { makeLocaleLandingHub } from "@/components/seo/landing-page"
import { localeStaticParams } from "@/lib/locale-routes"

const hub = makeLocaleLandingHub("best")
export const generateStaticParams = localeStaticParams
export const generateMetadata = hub.generateMetadata
export default hub.Page
