
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="container py-12 md:py-16">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-headline">Privacy Policy</CardTitle>
          <p className="text-muted-foreground pt-2">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </CardHeader>
        <CardContent className="prose prose-lg max-w-none text-muted-foreground dark:prose-invert prose-headings:font-headline prose-headings:text-foreground">
          <p>Chipukizi VOD Worker Cooperative ("us", "we", or "our") operates the Chipukizi VOD Cooperative Society website (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>

          <h2>1. Information Collection and Use</h2>
          <p>We collect several different types of information for various purposes to provide and improve our Service to you. This may include, but is not limited to, your email address, name, and usage data.</p>
          
          <h2>2. Log Data</h2>
          <p>We may also collect information that your browser sends whenever you visit our Service ("Log Data"). This Log Data may include information such as your computer's Internet Protocol ("IP") address, browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, and other statistics.</p>

          <h2>3. Cookies</h2>
          <p>Cookies are files with a small amount of data, which may include an anonymous unique identifier. We use cookies to collect information to improve our services for you. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>

          <h2>4. Service Providers</h2>
          <p>We may employ third-party companies and individuals to facilitate our Service, to provide the Service on our behalf, to perform Service-related services, or to assist us in analyzing how our Service is used. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</p>

          <h2>5. Security</h2>
          <p>The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>
          
          <h2>6. Links to Other Sites</h2>
          <p>Our Service may contain links to other sites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.</p>

          <h2>7. Changes to This Privacy Policy</h2>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>

          <h2>8. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please <a href="/contact" className="text-primary hover:underline">contact us</a>.</p>
        </CardContent>
      </Card>
    </div>
  );
}
