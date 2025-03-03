import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
            <p className="text-sm text-gray-500">Last updated: March 3, 2024</p>
          </div>

          <div className="prose prose-blue max-w-none">
            <p>
              Welcome to TranslationFlow. Please read these Terms of Service carefully before using our services.
            </p>

            <h2 className="text-xl font-bold mt-6 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using TranslationFlow, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.
            </p>

            <h2 className="text-xl font-bold mt-6 mb-4">2. Changes to Terms</h2>
            <p>
              We may modify the Terms at any time, at our sole discretion. If we do so, we&apos;ll let you know either by posting the modified Terms on the Site or through other communications. It&apos;s important that you review the Terms whenever we modify them because if you continue to use the Service after we have posted modified Terms on the Site, you are indicating to us that you agree to be bound by the modified Terms.
            </p>

            <h2 className="text-xl font-bold mt-6 mb-4">3. Account Registration</h2>
            <p>
              To use certain features of the Service, you must register for an account. When you register, you agree to provide accurate and complete information and to keep this information updated. You are responsible for safeguarding your account credentials and for all activities that occur under your account.
            </p>

            <h2 className="text-xl font-bold mt-6 mb-4">4. User Content</h2>
            <p>
              Our Service allows you to post, store, and share content, including translations, documents, and other materials (collectively, &quot;User Content&quot;). You retain ownership of any intellectual property rights that you hold in that User Content. By posting or otherwise making available any User Content on the Service, you grant to TranslationFlow a non-exclusive, royalty-free, worldwide, sublicensable, and transferable license to use, reproduce, modify, and display your User Content solely for the purposes of operating and improving our Service.
            </p>

            <h2 className="text-xl font-bold mt-6 mb-4">5. Prohibited Conduct</h2>
            <p>
              You agree not to engage in any of the following prohibited activities:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Using the Service for any illegal purpose or in violation of any local, state, national, or international law</li>
              <li>Violating or infringing the rights of others, including their intellectual property, privacy, or publicity rights</li>
              <li>Interfering with or disrupting the operation of the Service or the servers or networks used to make the Service available</li>
              <li>Attempting to gain unauthorized access to the Service, user accounts, or computer systems or networks</li>
              <li>Engaging in any harassing, intimidating, predatory, or abusive behavior</li>
            </ul>

            <h2 className="text-xl font-bold mt-6 mb-4">6. Termination</h2>
            <p>
              We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
            </p>

            <h2 className="text-xl font-bold mt-6 mb-4">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, in no event shall TranslationFlow, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage.
            </p>

            <h2 className="text-xl font-bold mt-6 mb-4">8. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
            </p>

            <h2 className="text-xl font-bold mt-6 mb-4">9. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="font-medium">support@translationflow.example.com</p>
          </div>

          <div className="mt-8 flex justify-center">
            <Link href="/">
              <Button variant="outline">Return to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}