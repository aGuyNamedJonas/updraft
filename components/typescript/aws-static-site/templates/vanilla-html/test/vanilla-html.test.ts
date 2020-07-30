import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as VanillaHtml from '../lib/vanilla-html-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new VanillaHtml.VanillaHtmlStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
