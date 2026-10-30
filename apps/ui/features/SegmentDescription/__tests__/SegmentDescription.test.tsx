// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { patchSegmentUrl } from '../../../api/requests/patchSegment';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import { SegmentDescription } from '../SegmentDescription';

describe('SegmentDescription', () => {
  it('should handle the editing of a description', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData({}));

    render(<SegmentDescription description="description" segmentId="segment-id" readOnly={false} />);
    const data = {
      segmentId: 'segment-id',
    };

    await userEvent.click(await screen.findByText('Edit segment description'));

    expect(await screen.findByText('Save description')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Description'), ' 1');
    await userEvent.click(screen.getByText('Save description'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(`${process.env.API_BASE_URL}${patchSegmentUrl(data.segmentId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          description: 'description 1',
        }),
        headers: {
          'Content-Type': 'application/json',
          cookie: '',
        },
      });
    });
  });

  it('should handle an error when saving a description', async () => {
    vi.spyOn(global, 'fetch').mockImplementationOnce(() => {
      throw new Error('Failed to save changes');
    });

    render(<SegmentDescription description="description" segmentId="segment-id" readOnly={false} />);

    await userEvent.click(await screen.findByText('Edit segment description'));

    expect(await screen.findByText('Save description')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Description'), ' 1');
    await userEvent.click(screen.getByText('Save description'));

    expect(await screen.findByText('System error')).toBeInTheDocument();
    expect(await screen.findByText('Something went wrong on our end. Try again in a moment.')).toBeInTheDocument();
    expect(screen.queryByText('Failed to save changes')).not.toBeInTheDocument();
  });
});
