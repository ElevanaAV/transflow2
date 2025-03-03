import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-sm text-gray-500">Last updated: March 3, 2024</p>
          </div>

          <div className="prose prose-blue max-w-none">
            <p>
              At TranslationFlow, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
            </p>

            <h2 className="text-xl font-bold mt-6 mb-4">Information We Collect</h2>
            <p>We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Personal information such as your name and email address when you register for an account</li>
              <li>Information about your translation projects, including source text, translations, and project metadata</li>
              <li>Communications you send to us</li>
              <li>Information collected automatically through cookies and similar technologies</li>
            </ul>

            <h2 className="text-xl font-bold mt-6 mb-4">How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process and complete transactions</li>
              <li>Send you technical notices, updates, security alerts, and support messages</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
            </ul>

            <h2 className="text-xl font-bold mt-6 mb-4">Information Sharing</h2>
            <p>We may share your information in the following situations:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>With your consent or at your direction</li>
              <li>With third-party vendors, consultants, and service providers who need access to such information to carry out work on our behalf</li>
              <li>In response to a request for information if we believe disclosure is in accordance with applicable law</li>
              <li>To protect the rights, property, and safety of TranslationFlow, our users, and the public</li>
            </ul>

            <h2 className="text-xl font-bold mt-6 mb-4">Data Security</h2>
            <p>
              We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. However, no security system is impenetrable, and we cannot guarantee the security of our systems.
            </p>

            <h2 className="text-xl font-bold mt-6 mb-4">Your Rights</h2>
            <p>Depending on your location, you may have rights regarding your personal information, including:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>The right to access personal information we hold about you</li>
              <li>The right to request that we delete your personal information</li>
              <li>The right to object to processing of your personal information</li>
              <li>The right to restrict processing of your personal information</li>
            </ul>

            <h2 className="text-xl font-bold mt-6 mb-4">Changes to This Privacy Policy</h2>
            <p>
              We may change this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, we may provide you with additional notice.
            </p>

            <h2 className="text-xl font-bold mt-6 mb-4">Contact Information</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
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