import { of } from 'rxjs';
import type { TeamMember } from '../../domain';
import { TeamService } from '../team.service';
import { TeamApiDataSource } from './team-api.data-source';

describe('TeamApiDataSource', () => {
  const member = (id: string): TeamMember => ({
    id,
    projectId: 'PROJECT-1',
    userId: `USER-${id}`,
    role: 'VOLUNTEER',
    isActive: true,
    startDate: '2026-01-01',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  });

  it('pages the full roster in memory and preserves the filtered total', (done) => {
    const team = jasmine.createSpyObj<TeamService>('TeamService', ['fetchTeam']);
    team.fetchTeam.and.returnValue(of({
      content: [member('1'), member('2'), member('3')],
      totalSize: 3,
      pageIndex: 0,
      pageSize: 3,
    }));
    const source = new TeamApiDataSource(team);

    source.loadListPage({
      chipId: 'active',
      criteria: { projectId: 'PROJECT-1' },
      pageIndex: 1,
      pageSize: 1,
    }).subscribe(page => {
      expect(team.fetchTeam).toHaveBeenCalledOnceWith('PROJECT-1');
      expect(page.content?.map(item => item.id)).toEqual(['2']);
      expect(page.totalSize).toBe(3);
      expect(page.pageIndex).toBe(1);
      expect(page.pageSize).toBe(1);
      done();
    });
  });

  it('does not call the roster endpoint without a project', (done) => {
    const team = jasmine.createSpyObj<TeamService>('TeamService', ['fetchTeam']);
    const source = new TeamApiDataSource(team);

    source.loadListPage({
      pageIndex: 0,
      pageSize: 12,
    }).subscribe(page => {
      expect(team.fetchTeam).not.toHaveBeenCalled();
      expect(page.totalSize).toBe(0);
      done();
    });
  });
});
