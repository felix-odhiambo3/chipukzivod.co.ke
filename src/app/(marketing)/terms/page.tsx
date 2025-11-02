
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="container py-12 md:py-16">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-headline">Terms of Service</CardTitle>
          <p className="text-muted-foreground pt-2">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </CardHeader>
        <CardContent className="prose prose-lg max-w-none text-muted-foreground dark:prose-invert prose-headings:font-headline prose-headings:text-foreground">
          <p>Please read these terms of service ("Terms", "Terms of Service") carefully before using the Chipukizi VOD Cooperative Society website (the "Service") operated by Chipukizi VOD Worker Cooperative ("us", "we", or "our").</p>
          <p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.</p>

          <h2>1. Agreement to Terms</h2>
          <p>By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</p>

          <h2>2. Intellectual Property</h2>
          <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Chipukizi VOD Worker Cooperative and its licensors. The Service is protected by copyright, trademark, and other laws of both Kenya and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Chipukizi VOD Worker Cooperative.</p>

          <h2>3. Links To Other Web Sites</h2>
          <p>Our Service may contain links to third-party web sites or services that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party web sites or services. You further acknowledge and agree that we shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods or services available on or through any such web sites or services.</p>

          <h2>4. Governing Law</h2>
          <p>These Terms shall be governed and construed in accordance with the laws of Kenya, without regard to its conflict of law provisions.</p>

          <h2>5. Disclaimer</h2>
          <p>Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.</p>
          
          <h2>6. Limitation Of Liability</h2>
          <p>In no event shall Chipukizi VOD Worker Cooperative, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage.</p>

          <h2>7. Changes</h2>
          <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>

          <h2>8. Contact Us</h2>
          <p>If you have any questions about these Terms, please <a href="/contact" className="text-primary hover:underline">contact us</a>.</p>
        </CardContent>
      </Card>
    </div>
  );
}
